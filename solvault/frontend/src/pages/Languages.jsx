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
  // TODO: add a state variable for the active tab ("login" or "signup")

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* TODO: close button using styles.closeBtn that calls onClose */}

        {/* TODO: <h2> that shows "Log in" or "Sign up" depending on the active tab */}

        {/* TODO: Google button using styles.googleBtn — onClick just console.log for now */}

        <div style={styles.divider}>or</div>

        {/* TODO: email <input> with styles.input */}
        {/* TODO: password <input> with styles.input */}

        {/* TODO: submit <button> using styles.submitBtn — label changes with active tab */}

        {/* TODO: toggle link at the bottom to switch between login and signup tabs */}
      </div>
    </div>
  );
}

export default function Languages() {
  // TODO: add state for the selected language code (initially null)
  // TODO: add state for whether the modal is visible (initially false)

  return (
    <div style={styles.page}>
      <h1 style={styles.heading}>Choose a language</h1>

      <div style={styles.grid}>
        {LANGUAGES.map((lang) => (
          // TODO: render a card div for each lang
          // - key={lang.code}
          // - style={styles.card(/* is this card selected? */)}
          // - onClick sets the selected language
          // - show lang.flag and lang.label inside
          <div key={lang.code} />
        ))}
      </div>

      {/* TODO: show a Continue button (styles.continueBtn) only when a language is selected
               clicking it should open the modal */}

      {/* TODO: render <AuthModal> when showModal is true, pass onClose to hide it */}
    </div>
  );
}
