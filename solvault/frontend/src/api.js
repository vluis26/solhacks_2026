import axios from "axios";
import { supabase } from "./supabaseClient";

const api = axios.create({ baseURL: "/api" });

export async function submitOnboarding(answers) {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;

  const payload = {
    name: answers.name,
    household_size: parseInt(answers.householdSize) || 1,
    monthly_income: parseFloat(answers.monthlyIncome) || 0,
    housing_type: answers.housingType,
    housing_payment: parseFloat(answers.housingPayment) || 0,
    debt: answers.debt === "yes" ? (answers.debtType || "yes") : "none",
    savings: parseFloat(answers.savings) || 0,
    goal: answers.goal,
  };

  return api.post("/onboarding", payload, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  }).then((res) => res.data);
}

export async function fetchDashboard(userId) {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;
  return api.get(`/dashboard/${userId}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  })
    .then((res) => res.data)
    .catch((err) => {
      if (err.response?.status === 404) throw new Error("NO_PACKAGE");
      throw err;
    });
}

export default api;
