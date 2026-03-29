import { useState } from "react";
import CashOutButton from "../components/CashOutButton";

export default function Remittance() {
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount]       = useState("");
  const [fiat, setFiat]           = useState("MXN");
  const [quote, setQuote]         = useState(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [txStatus, setTxStatus]   = useState(""); // confirmed | finalized

  async function fetchQuote() {
    if (!amount || parseFloat(amount) <= 0) return;
    setQuoteLoading(true);
    try {
      const res  = await fetch("/api/remittance/quote", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ amount: parseFloat(amount) }),
      });
      const data = await res.json();
      setQuote(data);
    } finally {
      setQuoteLoading(false);
    }
  }

  const showCashOut = txStatus === "confirmed" || txStatus === "finalized"
    || (import.meta.env.DEV && recipient && parseFloat(amount) > 0);

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h1 style={styles.title}>Send Money Home</h1>
        <p style={styles.sub}>Send USDC instantly to family — fees under $0.001</p>
      </div>

      <div style={styles.card}>
        <label style={styles.label}>Recipient wallet address</label>
        <input
          placeholder="e.g. 7xKX…"
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
          style={styles.input}
        />

        <label style={styles.label}>Amount (USD)</label>
        <input
          type="number"
          placeholder="50"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          style={styles.input}
        />

        <label style={styles.label}>Recipient receives in</label>
        <select value={fiat} onChange={(e) => setFiat(e.target.value)} style={styles.input}>
          <option value="MXN">🇲🇽 MXN — Mexico (SPEI)</option>
          <option value="GTQ">🇬🇹 GTQ — Guatemala</option>
          <option value="COP">🇨🇴 COP — Colombia</option>
          <option value="BRL">🇧🇷 BRL — Brazil (PIX)</option>
          <option value="ARS">🇦🇷 ARS — Argentina</option>
        </select>

        <button
          onClick={fetchQuote}
          disabled={quoteLoading || !amount}
          style={styles.btnBlue}
        >
          {quoteLoading ? "Getting quote…" : "Get Quote"}
        </button>

        {quote && (
          <div style={styles.quoteBox}>
            <p style={styles.quoteHeadline}>{quote.headline}</p>
            <div style={styles.quoteRow}>
              <span>Our fee</span>
              <strong style={{ color: "#16a34a" }}>${quote.hispanicchain.fee_usd}</strong>
            </div>
            <div style={styles.quoteRow}>
              <span>Recipient gets</span>
              <strong>${quote.hispanicchain.recipient_gets_usd} USDC</strong>
            </div>
            <div style={styles.quoteRow}>
              <span>Settlement</span>
              <strong>{quote.hispanicchain.settlement_time}</strong>
            </div>

            <div style={styles.competitorHeader}>vs. traditional providers</div>
            {quote.competitors.map((c) => (
              <div key={c.provider} style={styles.competitorRow}>
                <span style={{ color: "#6b7280" }}>{c.provider}</span>
                <span style={{ color: "#dc2626" }}>
                  ${c.fee_usd} ({c.fee_pct}) — you save ${c.you_save_usd}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {showCashOut && (
        <div style={styles.cashOutSection}>
          {txStatus ? (
            <p style={styles.successMsg}>✓ USDC delivered. Recipient can now cash out:</p>
          ) : (
            <p style={styles.devNote}>Dev mode: test Cash Out without a real transaction</p>
          )}
          <CashOutButton
            wallet={recipient || "DemoWalletAddressHere"}
            amount={parseFloat(amount) || 50}
            fiat={fiat}
          />
        </div>
      )}
    </div>
  );
}

const styles = {
  page:   { maxWidth: "520px", margin: "0 auto", padding: "2rem 1.5rem", fontFamily: "sans-serif" },
  header: { marginBottom: "1.5rem" },
  title:  { fontSize: "1.75rem", fontWeight: 700, margin: 0 },
  sub:    { color: "#555", marginTop: "0.4rem", fontSize: "1rem" },
  card: {
    border: "1px solid #e2e8f0", borderRadius: "10px",
    padding: "1.5rem", backgroundColor: "#fff",
  },
  label:  { display: "block", fontSize: "0.875rem", fontWeight: 600, color: "#374151", marginBottom: "4px" },
  input: {
    display: "block", width: "100%", padding: "10px 12px", marginBottom: "1rem",
    borderRadius: "8px", border: "1px solid #d1d5db", fontSize: "14px", boxSizing: "border-box",
  },
  btnBlue: {
    backgroundColor: "#6366f1", color: "#fff", border: "none",
    borderRadius: "8px", padding: "12px 24px", fontSize: "15px",
    fontWeight: "500", cursor: "pointer", width: "100%", marginBottom: "1rem",
  },
  quoteBox: {
    backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0",
    borderRadius: "8px", padding: "12px 16px", marginTop: "4px",
  },
  quoteHeadline: { fontSize: "13px", color: "#166534", marginBottom: "8px", margin: "0 0 8px" },
  quoteRow: {
    display: "flex", justifyContent: "space-between",
    fontSize: "14px", padding: "4px 0",
  },
  competitorHeader: { fontSize: "11px", textTransform: "uppercase", color: "#9ca3af", marginTop: "12px", marginBottom: "4px" },
  competitorRow: {
    display: "flex", justifyContent: "space-between",
    fontSize: "12px", padding: "2px 0",
  },
  cashOutSection: { marginTop: "1.5rem" },
  successMsg: { color: "#16a34a", fontWeight: 500, marginBottom: "12px" },
  devNote: { fontSize: "12px", color: "#9ca3af", marginBottom: "8px" },
};
