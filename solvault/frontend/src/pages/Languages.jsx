import { useState } from "react";

const LANGUAGES = [
  { code: "es", label: "Spanish", flag: "🇪🇸" },
  { code: "fr", label: "French", flag: "🇫🇷" },
  { code: "zh", label: "Mandarin", flag: "🇨🇳" },
  { code: "ja", label: "Japanese", flag: "🇯🇵" },
  { code: "de", label: "German", flag: "🇩🇪" },
  { code: "pt", label: "Portuguese", flag: "🇧🇷" },
];

const styles = {
  page: { padding: "2rem" },
  heading: { marginBottom: "1.5rem" },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
    gap: "1rem",
    maxWidth: "600px",
  },
  card: (selected) => ({
    padding: "1.25rem",
    textAlign: "center",
    cursor: "pointer",
    border: selected ? "2px solid #4f46e5" : "2px solid #ddd",
    borderRadius: "8px",
    backgroundColor: selected ? "#eef2ff" : "#fff",
  }),
  flag: { fontSize: "2rem", marginBottom: "0.5rem" },
  continueBtn: {
    marginTop: "1.5rem",
    padding: "0.75rem 2rem",
    fontSize: "1rem",
    cursor: "pointer",
    backgroundColor: "#4f46e5",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
  },
  // Modal
  overlay: {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(0,0,0,0.4)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  modal: {
    backgroundColor: "#fff",
    borderRadius: "10px",
    padding: "2rem",
    width: "320px",
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  },
  googleBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.5rem",
    padding: "0.65rem",
    border: "1px solid #ddd",
    borderRadius: "6px",
    cursor: "pointer",
    backgroundColor: "#fff",
    fontSize: "0.95rem",
  },
  divider: { textAlign: "center", color: "#aaa", fontSize: "0.85rem" },
  input: {
    padding: "0.6rem",
    border: "1px solid #ddd",
    borderRadius: "6px",
    fontSize: "0.95rem",
  },
  submitBtn: {
    padding: "0.65rem",
    backgroundColor: "#4f46e5",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "0.95rem",
  },
  closeBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
    alignSelf: "flex-end",
    fontSize: "1.1rem",
    color: "#888",
  },
};

function AuthModal({ onClose }) {
  const [activeTab, setActiveTab] = useState("login");

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button style={styles.closeBtn} onClick={onClose}>&times;</button>
        <h2>{activeTab === "login" ? "Log in" : "Sign up"}</h2>

        <button
          style={styles.googleBtn}
          onClick={() => console.log(`${activeTab} with Google`)}
        >
          <span>Continue with Google</span>
        </button>

        <div style={styles.divider}>or</div>

        <input type="email" placeholder="Email" style={styles.input} />
        <input type="password" placeholder="Password" style={styles.input} />

        <button style={styles.submitBtn}>
          {activeTab === "login" ? "Log in" : "Sign up"}
        </button>

        <div style={{ textAlign: "center", marginTop: "0.75rem" }}>
          {activeTab === "login" ? (
            <>
              Don't have an account?{" "}
              <button
                style={{ ...styles.googleBtn, padding: "0.25rem 0.5rem" }}
                onClick={() => setActiveTab("signup")}
              >
                Sign up
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button
                style={{ ...styles.googleBtn, padding: "0.25rem 0.5rem" }}
                onClick={() => setActiveTab("login")}
              >
                Log in
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Languages() {
  const [selectedLang, setSelectedLang] = useState(null);
  const [showModal, setShowModal] = useState(false);

  return (
    <div style={styles.page}>
      <h1 style={styles.heading}>Choose a language</h1>

      <div style={styles.grid}>
        {LANGUAGES.map((lang) => (
          <div
            key={lang.code}
            style={styles.card(selectedLang === lang.code)}
            onClick={() => setSelectedLang(lang.code)}
          >
            <div style={styles.flag}>{lang.flag}</div>
            <div>{lang.label}</div>
          </div>
        ))}
      </div>

      {selectedLang && (
        <button style={styles.continueBtn} onClick={() => setShowModal(true)}>
          Continue
        </button>
      )}

      {showModal && <AuthModal onClose={() => setShowModal(false)} />}
    </div>
  );
}
