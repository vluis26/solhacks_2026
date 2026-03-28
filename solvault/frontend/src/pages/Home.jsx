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
  // TODO: call useNavigate() and store the result in a variable
  const navigate = useNavigate();

  return (
    <div style={styles.hero}>
      
      {/* TODO: add an <h1> with styles.title */}
      <h1 style={styles.title}>Welcome to Solvault</h1>
      
      {/* TODO: add a <p> with styles.description and a short tagline */}
      <p style={styles.description}>
        Your ultimate destination for exploring and learning programming languages.
      </p>
      
      {/* TODO: add a <button> with styles.cta that navigates to "/languages" on click */}
      <button style={styles.cta} onClick={() => navigate("/languages")}>
        Explore Languages
      </button>
      
    </div>
  );
}
