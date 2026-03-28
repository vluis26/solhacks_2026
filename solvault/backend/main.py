import uuid
import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()
url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_KEY")
supabase = create_client(url, key)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

profiles: dict = {}


class OnboardingRequest(BaseModel):
    name: str
    household_size: str
    income: str
    housing_type: str
    housing_payment: str
    debt: str
    savings: str
    goal: str



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
        "debt": profile["debt"],
        "goal": profile["goal"],
    }



@app.get("/api/health")
def health():
    return {"status": "ok"}


@app.post("/api/onboarding", status_code=201)
def submit_onboarding(body: OnboardingRequest):
    result = supabase.table("user_profiles").insert(body.model_dump()).execute()
    user_id = result.data[0]["id"]
    return {"id": user_id}


@app.get("/api/dashboard/mock")
def get_mock_dashboard():
    return compute_dashboard(MOCK_PROFILE)


@app.get("/api/dashboard/{user_id}")
def get_dashboard(user_id: str):
    profile = profiles.get(user_id)
    if not profile:
        raise HTTPException(status_code=404, detail="User not found")
    return compute_dashboard(profile)
