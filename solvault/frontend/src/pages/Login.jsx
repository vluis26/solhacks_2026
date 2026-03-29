/*
 * SUPABASE SETUP CHECKLIST (do this before testing Google Auth):
 *
 * 1. Go to https://supabase.com/dashboard → your project
 *    → Authentication → Providers → enable Google
 *
 * 2. Paste your Google OAuth credentials:
 *    - Client ID and Client Secret from Google Cloud Console
 *    (APIs & Services → Credentials → OAuth 2.0 Client IDs)
 *
 * 3. In Supabase → Authentication → URL Configuration,
 *    add http://localhost:5173 to "Redirect URLs"
 */

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { useAuth } from "../context/AuthContext";

const styles = {
  page: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "80vh",
  },
  card: {
    border: "1px solid #e2e8f0",
    borderRadius: "12px",
    padding: "2.5rem 2rem",
    width: "340px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "1.25rem",
    backgroundColor: "#fff",
  },
  title: {
    fontSize: "1.5rem",
    fontWeight: 700,
    margin: 0,
  },
  subtitle: {
    fontSize: "0.95rem",
    color: "#555",
    margin: 0,
    textAlign: "center",
  },
  googleBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.6rem",
    width: "100%",
    padding: "0.75rem",
    border: "1px solid #ddd",
    borderRadius: "6px",
    cursor: "pointer",
    backgroundColor: "#fff",
    fontSize: "0.95rem",
    fontWeight: 500,
  },
};

export default function Login() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) navigate("/dashboard");
  }, [user, loading, navigate]);

  async function handleGoogleSignIn() {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin + "/dashboard" },
    });
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>FuturoSeguro</h1>
        <p style={styles.subtitle}>Financial planning for immigrant families</p>
        <button style={styles.googleBtn} onClick={handleGoogleSignIn}>
          <img
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
            alt="Google"
            width={18}
            height={18}
          />
          Continue with Google
        </button>
      </div>
    </div>
  );
}
