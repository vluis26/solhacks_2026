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
  const [tab, setTab] = useState("login");

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button style={styles.closeBtn} onClick={onClose}>✕</button>
        <h2 style={{ margin: 0 }}>{tab === "login" ? "Log in" : "Sign up"}</h2>

        <button
          style={styles.googleBtn}
          onClick={() => console.log("Google auth clicked")}
        >
          <img
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
            alt="Google"
            width={18}
            height={18}
          />
          Continue with Google
        </button>

        <div style={styles.divider}>or</div>

        <input style={styles.input} type="email" placeholder="Email" />
        <input style={styles.input} type="password" placeholder="Password" />

        <button style={styles.submitBtn}>
          {tab === "login" ? "Log in" : "Create account"}
        </button>

        <p style={{ textAlign: "center", margin: 0, fontSize: "0.85rem" }}>
          {tab === "login" ? (
            <>No account?{" "}
              <span
                style={{ color: "#4f46e5", cursor: "pointer" }}
                onClick={() => setTab("signup")}
              >Sign up</span>
            </>
          ) : (
            <>Already have one?{" "}
              <span
                style={{ color: "#4f46e5", cursor: "pointer" }}
                onClick={() => setTab("login")}
              >Log in</span>
            </>
          )}
        </p>
      </div>
    </div>
  );
}

export default function Languages() {
  const [selected, setSelected] = useState(null);
  const [showModal, setShowModal] = useState(false);

  return (
    <div style={styles.page}>
      <h1 style={styles.heading}>Choose a language</h1>

      <div style={styles.grid}>
        {LANGUAGES.map((lang) => (
          <div
            key={lang.code}
            style={styles.card(selected === lang.code)}
            onClick={() => setSelected(lang.code)}
          >
            <div style={styles.flag}>{lang.flag}</div>
            <div>{lang.label}</div>
          </div>
        ))}
      </div>

      {selected && (
        <button style={styles.continueBtn} onClick={() => setShowModal(true)}>
          Continue
        </button>
      )}

      {showModal && <AuthModal onClose={() => setShowModal(false)} />}
    </div>
  );
}
