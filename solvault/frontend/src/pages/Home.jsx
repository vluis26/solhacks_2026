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

  return (
    <div style={styles.hero}>
      {/* TODO: add an <h1> with styles.title */}

      {/* TODO: add a <p> with styles.description and a short tagline */}

      {/* TODO: add a <button> with styles.cta that navigates to "/languages" on click */}
    </div>
  );
}
