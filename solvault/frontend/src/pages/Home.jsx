import { useNavigate } from "react-router-dom";

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
    backgroundColor: "#4f46e5",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
  },
};

export default function Home() {
  const navigate = useNavigate();

  return (
    <div style={styles.hero}>
      <h1 style={styles.title}>Learn a new language today</h1>
      <p style={styles.description}>
        Pick a language, start practising, and track your progress — all in one place.
      </p>
      <button style={styles.cta} onClick={() => navigate("/languages")}>
        Get Started
      </button>
    </div>
  );
}
