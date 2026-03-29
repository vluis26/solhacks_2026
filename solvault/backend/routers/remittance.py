"""
routers/remittance.py
Remittance + Solana Blinks endpoints (FastAPI version).
"""

import os
from typing import Optional
from fastapi import APIRouter, HTTPException, Query, Response
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from services.solana_service import (
    build_transfer_transaction,
    check_transaction_status,
    get_fee_quote,
    SOLANA_FEE_USD,
    USDC_MINT_STR,
)

remittance_router = APIRouter(prefix="/api/remittance", tags=["remittance"])
actions_router    = APIRouter(prefix="/api/actions",    tags=["actions"])

APP_BASE_URL = os.getenv("APP_BASE_URL", "http://localhost:8000")


# ── Schemas ───────────────────────────────────────────────────────────────────

class SendRequest(BaseModel):
    sender:    str
    recipient: str
    amount:    float

class QuoteRequest(BaseModel):
    amount: float

class BlinkExecuteRequest(BaseModel):
    account: str


# ── Validation helper ─────────────────────────────────────────────────────────

def _validate_amount(amount: float):
    if amount <= 0:
        raise HTTPException(status_code=400, detail="amount must be greater than 0")
    if amount > 10_000:
        raise HTTPException(status_code=400, detail="amount exceeds demo limit of $10,000")


# ── POST /api/remittance/send ─────────────────────────────────────────────────

@remittance_router.post("/send")
def send(body: SendRequest):
    _validate_amount(body.amount)
    if not body.sender:
        raise HTTPException(status_code=400, detail="sender is required")
    if not body.recipient:
        raise HTTPException(status_code=400, detail="recipient is required")
    if body.sender == body.recipient:
        raise HTTPException(status_code=400, detail="recipient must differ from sender")

    result = build_transfer_transaction(body.sender, body.recipient, body.amount)
    if not result["ok"]:
        raise HTTPException(status_code=500, detail=result["error"])

    result["explorer_base"] = "https://explorer.solana.com/tx/{signature}?cluster=devnet"
    result["instructions"] = (
        "Deserialize the base64 transaction, have the sender sign it in their wallet, "
        "then broadcast it. Use the signature with GET /api/remittance/status."
    )
    return result


# ── GET /api/remittance/status ────────────────────────────────────────────────

@remittance_router.get("/status")
def status(signature: str = Query(..., min_length=40)):
    result = check_transaction_status(signature)
    if result.get("status") == "error":
        raise HTTPException(status_code=500, detail=result.get("error"))
    return result


# ── POST /api/remittance/quote ────────────────────────────────────────────────

@remittance_router.post("/quote")
def quote(body: QuoteRequest):
    _validate_amount(body.amount)
    return get_fee_quote(body.amount)


# ── Solana Blinks (Actions) ───────────────────────────────────────────────────

@actions_router.get("/send")
def blink_metadata(
    recipient: str = Query(""),
    amount:    str = Query(""),
):
    content = {
        "icon":        f"{APP_BASE_URL}/static/logo.png",
        "title":       "FuturoSeguro Remittance",
        "description": (
            f"Send USDC instantly to {recipient or 'a wallet'} "
            f"{'for $' + amount if amount else ''}. "
            f"Fee: ${SOLANA_FEE_USD:.5f}. Settles in < 1 second."
        ),
        "label": "Send USDC",
        "links": {
            "actions": [
                {
                    "label": "Send",
                    "href":  f"{APP_BASE_URL}/api/actions/send?recipient={recipient}&amount={amount}",
                    "parameters": [
                        *([{"name": "recipient", "label": "Recipient wallet address", "required": True}] if not recipient else []),
                        *([{"name": "amount",    "label": "Amount (USD)",             "required": True}] if not amount    else []),
                    ],
                }
            ]
        },
    }
    return JSONResponse(
        content=content,
        headers={
            "Access-Control-Allow-Origin": "*",
            "X-Action-Version":            "1",
            "X-Blockchain-Ids":            "solana:devnet",
        },
    )


@actions_router.post("/send")
def blink_execute(
    body:      BlinkExecuteRequest,
    recipient: str   = Query(...),
    amount:    float = Query(...),
):
    _validate_amount(amount)
    if not body.account:
        raise HTTPException(status_code=400, detail="account is required (injected by wallet)")
    if not recipient:
        raise HTTPException(status_code=400, detail="recipient is required as query param")

    result = build_transfer_transaction(body.account, recipient, amount)
    if not result["ok"]:
        raise HTTPException(status_code=500, detail=result["error"])

    return JSONResponse(
        content={
            "transaction": result["transaction"],
            "message":     f"Sending ${amount:.2f} USDC to {recipient[:8]}… Fee: ${SOLANA_FEE_USD:.5f}",
        },
        headers={
            "Access-Control-Allow-Origin": "*",
            "X-Action-Version":            "1",
        },
    )


@actions_router.options("/send")
def blink_options():
    return JSONResponse(
        content={},
        headers={
            "Access-Control-Allow-Origin":  "*",
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
        },
    )
