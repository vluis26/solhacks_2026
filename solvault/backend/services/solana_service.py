"""
services/solana_service.py
Solana + USDC logic using only solders + solana-py (no spl package).
SPL token instructions are built manually from their on-chain spec.
"""

import os
import asyncio
import struct
import base64
from solders.pubkey import Pubkey
from solders.keypair import Keypair
from solders.instruction import Instruction, AccountMeta
from solders.hash import Hash
from solders.message import Message
from solders.transaction import Transaction
from solders.system_program import ID as SYS_PROGRAM_ID
from solana.rpc.async_api import AsyncClient
from solana.rpc.commitment import Confirmed

# ── Constants ────────────────────────────────────────────────────────────────

RPC_URL       = os.getenv("SOLANA_RPC_URL", "https://api.devnet.solana.com")
USDC_MINT_STR = os.getenv("USDC_MINT", "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU")
USDC_MINT     = Pubkey.from_string(USDC_MINT_STR)
USDC_DECIMALS = 6

TOKEN_PROGRAM_ID            = Pubkey.from_string("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA")
ASSOCIATED_TOKEN_PROGRAM_ID = Pubkey.from_string("ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJe1brs")

COMPETITOR_FEES = {
    "Western Union": 0.0650,
    "MoneyGram":     0.0595,
    "Remitly":       0.0350,
    "Wire transfer": 0.0800,
}

SOLANA_FEE_USD = 0.00025


# ── SPL helpers (no spl package needed) ──────────────────────────────────────

def get_associated_token_address(owner: Pubkey, mint: Pubkey) -> Pubkey:
    """Derive the Associated Token Account address deterministically."""
    seeds = [bytes(owner), bytes(TOKEN_PROGRAM_ID), bytes(mint)]
    ata, _ = Pubkey.find_program_address(seeds, ASSOCIATED_TOKEN_PROGRAM_ID)
    return ata


def create_associated_token_account_ix(payer: Pubkey, owner: Pubkey, mint: Pubkey) -> Instruction:
    """Build a CreateAssociatedTokenAccount instruction (idempotent v1)."""
    ata = get_associated_token_address(owner, mint)
    return Instruction(
        program_id=ASSOCIATED_TOKEN_PROGRAM_ID,
        accounts=[
            AccountMeta(pubkey=payer, is_signer=True,  is_writable=True),
            AccountMeta(pubkey=ata,   is_signer=False, is_writable=True),
            AccountMeta(pubkey=owner, is_signer=False, is_writable=False),
            AccountMeta(pubkey=mint,  is_signer=False, is_writable=False),
            AccountMeta(pubkey=SYS_PROGRAM_ID,  is_signer=False, is_writable=False),
            AccountMeta(pubkey=TOKEN_PROGRAM_ID, is_signer=False, is_writable=False),
        ],
        data=bytes([0]),  # idempotent create
    )


def transfer_checked_ix(
    source: Pubkey,
    mint: Pubkey,
    dest: Pubkey,
    owner: Pubkey,
    amount: int,
    decimals: int,
) -> Instruction:
    """
    Build a SPL Token TransferChecked instruction.
    Opcode 12, data layout: [u8 opcode][u64 amount LE][u8 decimals]
    """
    data = bytes([12]) + struct.pack("<Q", amount) + bytes([decimals])
    return Instruction(
        program_id=TOKEN_PROGRAM_ID,
        accounts=[
            AccountMeta(pubkey=source, is_signer=False, is_writable=True),
            AccountMeta(pubkey=mint,   is_signer=False, is_writable=False),
            AccountMeta(pubkey=dest,   is_signer=False, is_writable=True),
            AccountMeta(pubkey=owner,  is_signer=True,  is_writable=False),
        ],
        data=data,
    )


# ── Wallet helpers ────────────────────────────────────────────────────────────

def load_app_wallet() -> Keypair:
    raw = os.getenv("APP_WALLET_PRIVATE_KEY", "")
    if not raw or raw == "your_base58_private_key_here":
        raise EnvironmentError(
            "APP_WALLET_PRIVATE_KEY not configured. Add it to backend/.env"
        )
    return Keypair.from_base58_string(raw)


def usd_to_usdc_units(amount_usd: float) -> int:
    return int(round(amount_usd * 10 ** USDC_DECIMALS))


def usdc_units_to_usd(units: int) -> float:
    return units / 10 ** USDC_DECIMALS


# ── Core async helpers ────────────────────────────────────────────────────────

async def _get_or_create_ata_ixs(
    client: AsyncClient,
    owner: Pubkey,
    payer: Pubkey,
) -> tuple[Pubkey, list]:
    """Returns (ata_address, [create_ix_if_needed])."""
    ata = get_associated_token_address(owner, USDC_MINT)
    info = await client.get_account_info(ata)
    ixs  = [] if info.value else [create_associated_token_account_ix(payer, owner, USDC_MINT)]
    return ata, ixs


async def _build_usdc_transfer_tx(
    sender_pubkey: Pubkey,
    recipient_pubkey: Pubkey,
    amount_usd: float,
    payer: Keypair,
) -> tuple[str, str]:
    """
    Builds an unsigned USDC transfer transaction.
    Returns (base64_transaction, blockhash_str).
    The transaction is partially signed by the fee payer (app wallet).
    The sender still needs to sign before broadcasting.
    """
    amount_units = usd_to_usdc_units(amount_usd)

    async with AsyncClient(RPC_URL) as client:
        sender_ata,    pre_ixs = await _get_or_create_ata_ixs(client, sender_pubkey,    payer.pubkey())
        recipient_ata, ata_ixs = await _get_or_create_ata_ixs(client, recipient_pubkey, payer.pubkey())

        transfer_ix = transfer_checked_ix(
            source=sender_ata,
            mint=USDC_MINT,
            dest=recipient_ata,
            owner=sender_pubkey,
            amount=amount_units,
            decimals=USDC_DECIMALS,
        )

        instructions = pre_ixs + ata_ixs + [transfer_ix]

        bh_resp   = await client.get_latest_blockhash(Confirmed)
        blockhash = bh_resp.value.blockhash

        msg = Message.new_with_blockhash(instructions, payer.pubkey(), blockhash)
        tx  = Transaction.new_unsigned(msg)
        # Partial-sign with the app wallet (fee payer)
        tx.partial_sign([payer], blockhash)

        tx_b64 = base64.b64encode(bytes(tx)).decode("utf-8")
        return tx_b64, str(blockhash)


async def _check_tx_status(signature: str) -> dict:
    async with AsyncClient(RPC_URL) as client:
        resp       = await client.get_signature_statuses([signature])
        status_val = resp.value[0]
        if status_val is None:
            return {"status": "not_found", "signature": signature}
        if status_val.err:
            return {"status": "failed", "signature": signature, "error": str(status_val.err)}
        finalized = status_val.confirmation_status == "finalized"
        return {
            "status":        "finalized" if finalized else "confirmed",
            "signature":     signature,
            "confirmations": status_val.confirmations or 0,
            "slot":          status_val.slot,
            "explorer_url":  f"https://explorer.solana.com/tx/{signature}?cluster=devnet",
        }


# ── Public sync wrappers ──────────────────────────────────────────────────────

def build_transfer_transaction(sender_address: str, recipient_address: str, amount_usd: float) -> dict:
    try:
        sender_pk    = Pubkey.from_string(sender_address)
        recipient_pk = Pubkey.from_string(recipient_address)
        payer        = load_app_wallet()
        tx_b64, blockhash = asyncio.run(
            _build_usdc_transfer_tx(sender_pk, recipient_pk, amount_usd, payer)
        )
        return {
            "ok":                True,
            "transaction":       tx_b64,
            "blockhash":         blockhash,
            "amount_usd":        amount_usd,
            "amount_usdc_units": usd_to_usdc_units(amount_usd),
            "sender":            sender_address,
            "recipient":         recipient_address,
            "estimated_fee_usd": SOLANA_FEE_USD,
        }
    except Exception as e:
        return {"ok": False, "error": str(e)}


def check_transaction_status(signature: str) -> dict:
    try:
        return asyncio.run(_check_tx_status(signature))
    except Exception as e:
        return {"status": "error", "error": str(e), "signature": signature}


def get_fee_quote(amount_usd: float) -> dict:
    our_fee     = SOLANA_FEE_USD
    comparisons = []
    for provider, rate in COMPETITOR_FEES.items():
        fee = round(amount_usd * rate, 4)
        comparisons.append({
            "provider":           provider,
            "fee_usd":            fee,
            "fee_pct":            f"{rate * 100:.1f}%",
            "recipient_gets_usd": round(amount_usd - fee, 2),
            "you_save_usd":       round(fee - our_fee, 2),
        })
    comparisons.sort(key=lambda x: x["fee_usd"], reverse=True)
    return {
        "ok":              True,
        "send_amount_usd": amount_usd,
        "hispanicchain": {
            "fee_usd":            our_fee,
            "fee_pct":            f"{(our_fee / amount_usd) * 100:.4f}%",
            "recipient_gets_usd": round(amount_usd - our_fee, 2),
            "settlement_time":    "< 1 second",
            "network":            "Solana devnet",
        },
        "competitors": comparisons,
        "headline": (
            f"Send ${amount_usd:.2f} for ${our_fee:.5f}. "
            f"Save up to ${comparisons[0]['you_save_usd']:.2f} vs {comparisons[0]['provider']}."
        ),
    }
