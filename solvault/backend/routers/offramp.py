"""
routers/offramp.py
Transak off-ramp endpoints (FastAPI version).
The API key is injected server-side — never sent to the client.
"""

from fastapi import APIRouter, HTTPException, Query
from services.transak_service import build_offramp_url, supported_corridors

offramp_router = APIRouter(prefix="/api/offramp", tags=["offramp"])

SUPPORTED_FIATS = {"MXN", "GTQ", "COP", "BRL", "ARS"}


# ── GET /api/offramp/url ──────────────────────────────────────────────────────

@offramp_router.get("/url")
def get_offramp_url(
    wallet: str   = Query(...),
    amount: float = Query(..., gt=0),
    fiat:   str   = Query("MXN"),
):
    fiat = fiat.upper().strip()
    if fiat not in SUPPORTED_FIATS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported fiat. Choose from: {', '.join(sorted(SUPPORTED_FIATS))}",
        )
    try:
        return build_offramp_url(wallet, amount, fiat)
    except EnvironmentError as e:
        raise HTTPException(status_code=500, detail=str(e))


# ── GET /api/offramp/corridors ────────────────────────────────────────────────

@offramp_router.get("/corridors")
def get_corridors():
    return supported_corridors()
