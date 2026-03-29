"""
services/transak_service.py
Builds Transak off-ramp URLs server-side so the API key never touches the frontend.
"""

import os
from urllib.parse import urlencode

TRANSAK_API_KEY = os.getenv("TRANSAK_API_KEY", "")
TRANSAK_ENV     = os.getenv("TRANSAK_ENV", "staging")

TRANSAK_URLS = {
    "staging":    "https://global-stg.transak.com",
    "production": "https://global.transak.com",
}


def build_offramp_url(wallet_address: str, amount_usdc: float, fiat_currency: str = "MXN") -> dict:
    api_key  = TRANSAK_API_KEY or "DEMO_KEY"
    is_demo  = not TRANSAK_API_KEY

    base_url = TRANSAK_URLS.get(TRANSAK_ENV, TRANSAK_URLS["staging"])
    params = {
        "apiKey":                   api_key,
        "productsAvailed":          "SELL",
        "cryptoCurrencyCode":       "USDC",
        "network":                  "solana",
        "fiatCurrency":             fiat_currency,
        "cryptoAmount":             amount_usdc,
        "walletAddress":            wallet_address,
        "disableWalletAddressForm": "true",
        "isFeeCalculationHidden":   "false",
        "hideMenu":                 "true",
        "themeColor":               "6366f1",
    }
    return {
        "ok":            True,
        "url":           f"{base_url}?{urlencode(params)}",
        "env":           TRANSAK_ENV,
        "wallet":        wallet_address,
        "amount_usdc":   amount_usdc,
        "fiat_currency": fiat_currency,
        "note":          "demo mode — add TRANSAK_API_KEY to .env for real widget" if is_demo else ("staging — no real funds" if TRANSAK_ENV == "staging" else "production — real money"),
    }


def supported_corridors() -> dict:
    return {
        "corridors": [
            {"country": "Mexico",    "fiat": "MXN", "method": "SPEI bank transfer"},
            {"country": "Guatemala", "fiat": "GTQ", "method": "Bank deposit"},
            {"country": "Colombia",  "fiat": "COP", "method": "Bank deposit"},
            {"country": "Brazil",    "fiat": "BRL", "method": "PIX"},
            {"country": "Argentina", "fiat": "ARS", "method": "Bank deposit"},
        ]
    }
