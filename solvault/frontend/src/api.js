import axios from "axios";

const api = axios.create({
  baseURL: "/api",
});

export function submitOnboarding(answers) {
  return api.post("/onboarding", answers).then((res) => res.data);
}

export function fetchDashboard(userId) {
  return api.get(`/dashboard/${userId}`).then((res) => res.data);
}

export default api;
