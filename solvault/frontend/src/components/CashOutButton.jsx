// components/CashOutButton.jsx
//
// Usage: <CashOutButton wallet="RECIPIENT_WALLET" amount={50} fiat="MXN" />
//
// Props:
//   wallet  : string  — recipient's Solana wallet address
//   amount  : number  — USDC amount to cash out
//   fiat    : string  — target currency (default: "MXN")
//   onClose : fn      — optional callback when modal closes

import { useState } from "react";

export default function CashOutButton({ wallet, amount, fiat = "MXN", onClose }) {
  const [state, setState]         = useState("idle"); // idle | loading | open | error
  const [transakUrl, setTransakUrl] = useState("");
  const [errorMsg, setErrorMsg]   = useState("");

  async function handleClick() {
    if (!wallet || !amount) {
      setErrorMsg("Wallet address and amount are required.");
      setState("error");
      return;
    }
    setState("loading");
    setErrorMsg("");
    try {
      const params = new URLSearchParams({ wallet, amount, fiat });
      const res    = await fetch(`/api/offramp/url?${params}`);
      const data   = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || "Could not generate cash-out link.");
      setTransakUrl(data.url);
      setState("open");
    } catch (err) {
      setErrorMsg(err.message);
      setState("error");
    }
  }

  function handleClose() {
    setState("idle");
    setTransakUrl("");
    onClose?.();
  }

  return (
    <>
      <button onClick={handleClick} disabled={state === "loading"} style={styles.button}>
        {state === "loading" ? "Loading…" : `Cash Out to ${fiat}`}
      </button>

      {state === "error" && <p style={styles.error}>{errorMsg}</p>}

      {state === "open" && (
        <div style={styles.overlay} onClick={handleClose}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <span style={styles.modalTitle}>Cash Out ${amount} USDC → {fiat}</span>
              <button onClick={handleClose} style={styles.closeBtn}>✕</button>
            </div>
            <iframe
              src={transakUrl}
              style={styles.iframe}
              allow="camera;microphone;payment"
              title="Cash Out"
            />
            <p style={styles.note}>Powered by Transak · Staging mode · No real funds</p>
          </div>
        </div>
      )}
    </>
  );
}

const styles = {
  button: {
    backgroundColor: "#4F6C2A", color: "#fff", border: "none",
    borderRadius: "8px", padding: "12px 24px", fontSize: "15px",
    fontWeight: "500", cursor: "pointer",
  },
  error: { color: "#dc2626", fontSize: "13px", marginTop: "8px" },
  overlay: {
    position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.6)",
    display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000,
  },
  modal: {
    backgroundColor: "#fff", borderRadius: "16px", width: "480px",
    maxWidth: "95vw", overflow: "hidden", display: "flex", flexDirection: "column",
  },
  modalHeader: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    padding: "16px 20px", borderBottom: "1px solid #e5e7eb",
  },
  modalTitle: { fontSize: "15px", fontWeight: "500", color: "#111827" },
  closeBtn: { background: "none", border: "none", fontSize: "16px", cursor: "pointer", color: "#6b7280", padding: "4px 8px" },
  iframe: { width: "100%", height: "620px", border: "none" },
  note: { fontSize: "11px", color: "#9ca3af", textAlign: "center", padding: "10px", margin: 0 },
};
