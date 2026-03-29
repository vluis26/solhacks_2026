import os
import re
import json
from typing import Optional
from fastapi import FastAPI, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()

from routers.remittance import remittance_router, actions_router
from routers.offramp import offramp_router

# ── optional integrations (gracefully absent in pure-local mode) ──────────────

supabase = None
gemini_model = None

_SUPABASE_URL = os.getenv("SUPABASE_URL")
_SUPABASE_KEY = os.getenv("SUPABASE_KEY")
_GEMINI_KEY = os.getenv("GEMINI_API_KEY")

if _SUPABASE_URL and _SUPABASE_KEY:
    from supabase import create_client
    supabase = create_client(_SUPABASE_URL, _SUPABASE_KEY)

if _GEMINI_KEY:
    import google.generativeai as genai
    genai.configure(api_key=_GEMINI_KEY)
    gemini_model = genai.GenerativeModel("gemini-2.5-flash")

# ── app ───────────────────────────────────────────────────────────────────────

app = FastAPI()

app.include_router(remittance_router)
app.include_router(actions_router)
app.include_router(offramp_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174",
                   "http://localhost:5175", "http://localhost:5176"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── schemas ───────────────────────────────────────────────────────────────────

class OnboardingRequest(BaseModel):
    name: str
    household_size: int
    monthly_income: float
    housing_type: str
    housing_payment: float
    debt: str
    savings: float
    goal: str

# ── auth helper ───────────────────────────────────────────────────────────────

def get_user_id(authorization: Optional[str]) -> str:
    if not supabase:
        raise HTTPException(status_code=503, detail="Supabase not configured")
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid token")
    token = authorization[7:]
    try:
        user_response = supabase.auth.get_user(token)
        user_id = user_response.user.id
        return user_id
    except Exception as e:
        print(f"Token validation error: {e}")
        raise HTTPException(status_code=401, detail=f"Invalid token: {str(e)}")

# ── gemini helper ─────────────────────────────────────────────────────────────

GEMINI_PROMPT = """\
You are a financial advisor helping an immigrant family in the US.
Based on these answers, generate a personalized financial package in JSON format only.

User answers:
{answers}

Return a JSON object with these exact keys:
{{
  "monthly_income": number,
  "weekly_income": number,
  "spending_plan": {{ "needs": number, "wants": number, "savings_debt": number }},
  "emergency_fund": {{ "target_low": number, "target_high": number, "current_savings": number, "gap": number }},
  "retirement_recommendation": string,
  "debt_advice": string,
  "goal": string,
  "action_items": [string, string, string, string, string],
  "summary": string
}}

The summary should be 2-3 sentences addressing the user by name.
Return only valid JSON — no markdown, no code fences, no extra text.\
"""

def call_gemini(answers: dict) -> dict:
    if not gemini_model:
        raise HTTPException(status_code=503, detail="Gemini not configured — add GEMINI_API_KEY to .env")
    prompt = GEMINI_PROMPT.format(answers=json.dumps(answers, indent=2))
    try:
        response = gemini_model.generate_content(prompt)
        text = response.text.strip()
        # Strip ``` fences if Gemini wraps the JSON anyway
        match = re.search(r"```(?:json)?\s*([\s\S]*?)```", text)
        if match:
            text = match.group(1).strip()
        return json.loads(text)
    except HTTPException:
        raise
    except Exception as e:
        err_str = str(e)
        if "429" in err_str or "resource_exhausted" in err_str.lower() or "ResourceExhausted" in type(e).__name__:
            raise HTTPException(
                status_code=503,
                detail="AI service temporarily unavailable, please try again in 1 minute",
            )
        raise HTTPException(status_code=500, detail=f"Failed to generate package: {err_str}")

# ── mock data (no DB required) ────────────────────────────────────────────────

MOCK_PROFILE = {
    "name": "Maria",
    "household_size": 4,
    "monthly_income": 3500,
    "housing_type": "rent",
    "housing_payment": 1200,
    "debt": "car loan, credit card",
    "savings": 800,
    "goal": "Save for my kids' future",
}

def compute_dashboard(profile: dict) -> dict:
    income = float(profile["monthly_income"])
    housing = float(profile["housing_payment"])
    savings = float(profile["savings"])
    target_low = housing * 3
    target_high = housing * 6
    has_debt = profile["debt"] not in ("none", "", "no")
    return {
        "name": profile["name"],
        "monthly_income": income,
        "weekly_income": round(income / 4, 2),
        "spending_plan": {
            "needs": round(income * 0.50, 2),
            "wants": round(income * 0.30, 2),
            "savings_debt": round(income * 0.20, 2),
        },
        "emergency_fund": {
            "target_low": round(target_low, 2),
            "target_high": round(target_high, 2),
            "current_savings": savings,
            "gap": round(max(0, target_low - savings), 2),
        },
        "retirement_recommendation": "Roth IRA" if income < 4000 else "401k",
        "debt_advice": (
            "Focus on paying off high-interest debt first: credit card → car loan → student loan."
            if has_debt else
            "No debt reported — great position to focus on savings and investing!"
        ),
        "debt": profile["debt"],
        "goal": profile["goal"],
        "action_items": [
            f"Open a {'Roth IRA' if income < 4000 else '401(k)'} account",
            "Build your emergency fund to 3 months of housing costs",
            "Pay off high-interest debt first" if has_debt else "Start a low-cost index fund",
            "Automate a fixed monthly savings transfer",
            "Review this plan in 3 months",
        ],
        "summary": (
            f"Hi {profile['name']}, based on your answers we've built a plan tailored to your family's needs. "
            f"Your top priority right now is building a financial safety net while working toward your goal: {profile['goal']}."
        ),
    }

# ── endpoints ─────────────────────────────────────────────────────────────────

@app.get("/api/health")
def health():
    return {"status": "ok"}


@app.get("/api/debug/token")
def debug_token(authorization: Optional[str] = Header(None)):
    if not supabase:
        return {"error": "Supabase not configured"}
    if not authorization or not authorization.startswith("Bearer "):
        return {"error": "No Bearer token in Authorization header"}
    token = authorization[7:]
    try:
        user_response = supabase.auth.get_user(token)
        return {"user_id": user_response.user.id, "email": user_response.user.email}
    except Exception as e:
        return {"error": str(e)}


@app.post("/api/onboarding", status_code=201)
def submit_onboarding(
    body: OnboardingRequest,
    authorization: Optional[str] = Header(None),
):
    user_id = get_user_id(authorization)

    # Save raw answers
    supabase.table("user_profiles").insert({
        **body.model_dump(),
        "user_id": user_id,
    }).execute()

    # Generate package with Gemini
    package = call_gemini(body.model_dump())
    package["name"] = body.name  # Guarantee name is present

    # Persist package
    supabase.table("financial_packages").insert({
        "user_id": user_id,
        "package": package,
    }).execute()

    return {"user_id": user_id, **package}


@app.get("/api/dashboard/mock")
def get_mock_dashboard():
    return compute_dashboard(MOCK_PROFILE)


@app.get("/api/dashboard/{user_id}")
def get_dashboard(user_id: str):
    if not supabase:
        raise HTTPException(status_code=503, detail="Supabase not configured")
    result = (
        supabase.table("financial_packages")
        .select("package")
        .eq("user_id", user_id)
        .order("created_at", desc=True)
        .limit(1)
        .execute()
    )
    if not result.data:
        raise HTTPException(status_code=404, detail="No package found")
    return result.data[0]["package"]
