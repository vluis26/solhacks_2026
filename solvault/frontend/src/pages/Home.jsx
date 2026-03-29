import { useNavigate } from "react-router-dom";
import logoFull from "../assets/logo-full.png";

const styles = {
  hero: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "6rem 2rem",
    textAlign: "center",
  },
  title: {
    fontSize: "2.5rem",
    marginBottom: "1rem",
  },
  description: {
    fontSize: "1.1rem",
    maxWidth: "480px",
    color: "#555",
    marginBottom: "2rem",
  },
  cta: {
    padding: "0.75rem 2rem",
    fontSize: "1rem",
    cursor: "pointer",
    backgroundColor: "#4F6C2A",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
  },
};

export default function Home() {
  const navigate = useNavigate();

  return (
    <div style={styles.hero}>
      <img src={logoFull} alt="Futuro Seguro" style={{ width: "320px", marginBottom: "1.5rem" }} />
      <p style={styles.description}>
        Personalized financial planning for immigrant families. Get a clear,
        actionable plan in minutes.
      </p>
      <button style={styles.cta} onClick={() => navigate("/login")}>
        Get My Free Plan
      </button>
    </div>
  );
}
