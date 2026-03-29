import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import logoIcon from "../assets/logo-icon.png";

const styles = {
  nav: {
    display: "flex",
    alignItems: "center",
    gap: "1.5rem",
    padding: "1rem 2rem",
    borderBottom: "1px solid #ddd",
  },
  link: {
    textDecoration: "none",
    color: "#333",
    fontWeight: 500,
  },
  spacer: { flex: 1 },
  userEmail: {
    fontSize: "0.875rem",
    color: "#555",
  },
  signOutBtn: {
    padding: "0.35rem 0.85rem",
    fontSize: "0.875rem",
    cursor: "pointer",
    backgroundColor: "#fff",
    border: "1px solid #ddd",
    borderRadius: "6px",
  },
};

export default function Navbar() {
  const { user, signOut } = useAuth();

  return (
    <nav style={styles.nav}>
      <Link to="/" style={{ display: "flex", alignItems: "center", lineHeight: 0 }}>
        <img src={logoIcon} alt="Futuro Seguro" style={{ height: "70px", width: "auto", display: "block", objectFit: "contain" }} />
      </Link>
      {user && <Link to="/dashboard" style={styles.link}>Dashboard</Link>}
      {user && <Link to="/remittance" style={styles.link}>Send Money</Link>}
      <div style={styles.spacer} />
      {user ? (
        <>
          <span style={styles.userEmail}>
            {user.user_metadata?.full_name || user.email}
          </span>
          <button style={styles.signOutBtn} onClick={signOut}>Sign Out</button>
        </>
      ) : (
        <Link to="/login" style={styles.link}>Login</Link>
      )}
    </nav>
  );
}
