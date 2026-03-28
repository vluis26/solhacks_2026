import { Link } from "react-router-dom";

const styles = {
  nav: {
    display: "flex",
    gap: "1.5rem",
    padding: "1rem 2rem",
    borderBottom: "1px solid #ddd",
  },
  link: {
    textDecoration: "none",
    color: "#333",
    fontWeight: 500,
  },
};

export default function Navbar() {
  return (
    <nav style={styles.nav}>
      <Link to="/" style={styles.link}>Home</Link>
      <Link to="/languages" style={styles.link}>Languages</Link>
      <Link to="/dashboard" style={styles.link}>Dashboard</Link>
    </nav>
  );
}
