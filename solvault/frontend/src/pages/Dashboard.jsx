import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchDashboard } from "../api";
import { useAuth } from "../context/AuthContext";

// ── helpers ──────────────────────────────────────────────────────────────────

function fmt(n) {
  return "$" + Number(n).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// ── styles ───────────────────────────────────────────────────────────────────

const styles = {
  page: {
    maxWidth: "960px",
    margin: "0 auto",
    padding: "2rem 1.5rem",
    fontFamily: "sans-serif",
  },
  header: {
    marginBottom: "2rem",
  },
  headerTitle: {
    fontSize: "1.75rem",
    fontWeight: 700,
    margin: 0,
  },
  headerSub: {
    color: "#555",
    marginTop: "0.4rem",
    fontSize: "1rem",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(420px, 1fr))",
    gap: "1.25rem",
  },
  card: {
    border: "1px solid #e2e8f0",
    borderRadius: "10px",
    padding: "1.5rem",
    backgroundColor: "#fff",
  },
  cardTitle: {
    fontSize: "0.75rem",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    color: "#6366f1",
    marginBottom: "1rem",
  },
  row: {
    display: "flex",
    justifyContent: "space-between",
    padding: "0.35rem 0",
    borderBottom: "1px solid #f1f5f9",
    fontSize: "0.95rem",
  },
  rowLabel: { color: "#555" },
  rowValue: { fontWeight: 600 },
  bar: (pct, color) => ({
    height: "8px",
    borderRadius: "4px",
    backgroundColor: color,
    width: pct + "%",
    marginTop: "4px",
  }),
  barTrack: {
    height: "8px",
    borderRadius: "4px",
    backgroundColor: "#f1f5f9",
    marginBottom: "0.75rem",
  },
  blurb: {
    fontSize: "0.95rem",
    color: "#444",
    lineHeight: 1.6,
  },
  tag: (color) => ({
    display: "inline-block",
    padding: "0.2rem 0.6rem",
    borderRadius: "4px",
    backgroundColor: color,
    fontSize: "0.8rem",
    fontWeight: 600,
    marginRight: "0.4rem",
    marginBottom: "0.4rem",
  }),
  checklist: {
    listStyle: "none",
    padding: 0,
    margin: 0,
  },
  checkItem: {
    display: "flex",
    alignItems: "flex-start",
    gap: "0.6rem",
    padding: "0.4rem 0",
    fontSize: "0.95rem",
    color: "#333",
  },
  checkBox: {
    marginTop: "2px",
    width: "16px",
    height: "16px",
    border: "2px solid #6366f1",
    borderRadius: "4px",
    flexShrink: 0,
  },
  loading: {
    padding: "4rem 2rem",
    textAlign: "center",
    color: "#888",
    fontSize: "1rem",
  },
  error: {
    padding: "4rem 2rem",
    textAlign: "center",
    color: "#e53e3e",
    fontSize: "1rem",
  },
  summary: {
    fontSize: "0.95rem",
    color: "#444",
    lineHeight: 1.6,
    marginTop: "0.75rem",
    padding: "0.75rem 1rem",
    backgroundColor: "#f8f9ff",
    borderLeft: "3px solid #6366f1",
    borderRadius: "0 6px 6px 0",
  },
  noPackage: {
    padding: "4rem 2rem",
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "1rem",
  },
  ctaLink: {
    padding: "0.75rem 2rem",
    backgroundColor: "#6366f1",
    color: "#fff",
    borderRadius: "6px",
    textDecoration: "none",
    fontWeight: 500,
  },
};

// ── cards ─────────────────────────────────────────────────────────────────────

function CashFlowCard({ data }) {
  return (
    <div style={styles.card}>
      <div style={styles.cardTitle}>Income &amp; Cash Flow</div>
      <div style={styles.row}>
        <span style={styles.rowLabel}>Monthly income</span>
        <span style={styles.rowValue}>{fmt(data.monthly_income)}</span>
      </div>
      <div style={styles.row}>
        <span style={styles.rowLabel}>Weekly estimate</span>
        <span style={styles.rowValue}>{fmt(data.weekly_income)}</span>
      </div>
    </div>
  );
}

function SpendingPlanCard({ plan }) {
  const buckets = [
    { label: "Needs (50%)", value: plan.needs, color: "#6366f1", pct: 50 },
    { label: "Wants (30%)", value: plan.wants, color: "#a78bfa", pct: 30 },
    { label: "Debt & Savings (20%)", value: plan.savings_debt, color: "#34d399", pct: 20 },
  ];
  return (
    <div style={styles.card}>
      <div style={styles.cardTitle}>Spending Plan — 50/30/20</div>
      {buckets.map((b) => (
        <div key={b.label}>
          <div style={styles.row}>
            <span style={styles.rowLabel}>{b.label}</span>
            <span style={styles.rowValue}>{fmt(b.value)}</span>
          </div>
          <div style={styles.barTrack}>
            <div style={styles.bar(b.pct, b.color)} />
          </div>
        </div>
      ))}
    </div>
  );
}

function EmergencyFundCard({ fund }) {
  const pct = Math.min(
    100,
    Math.round((fund.current_savings / fund.target_low) * 100)
  );
  return (
    <div style={styles.card}>
      <div style={styles.cardTitle}>Emergency Fund</div>
      <div style={styles.row}>
        <span style={styles.rowLabel}>3-month target</span>
        <span style={styles.rowValue}>{fmt(fund.target_low)}</span>
      </div>
      <div style={styles.row}>
        <span style={styles.rowLabel}>6-month target</span>
        <span style={styles.rowValue}>{fmt(fund.target_high)}</span>
      </div>
      <div style={styles.row}>
        <span style={styles.rowLabel}>Currently saved</span>
        <span style={styles.rowValue}>{fmt(fund.current_savings)}</span>
      </div>
      <div style={{ marginTop: "1rem" }}>
        <div style={{ fontSize: "0.85rem", color: "#555", marginBottom: "4px" }}>
          Progress toward 3-month goal — {pct}%
        </div>
        <div style={styles.barTrack}>
          <div style={styles.bar(pct, pct >= 100 ? "#34d399" : "#6366f1")} />
        </div>
      </div>
    </div>
  );
}

function RetirementCard({ recommendation }) {
  const useRoth = recommendation === "Roth IRA";
  return (
    <div style={styles.card}>
      <div style={styles.cardTitle}>Retirement Basics</div>
      <p style={styles.blurb}>
        Based on your income, we recommend starting with a{" "}
        <strong>{recommendation}</strong>.{" "}
        {useRoth
          ? "A Roth IRA lets you contribute after-tax dollars so your withdrawals in retirement are tax-free — great when you expect your income to grow."
          : "A 401(k) reduces your taxable income today and many employers offer matching contributions, which is free money toward your future."}
      </p>
      <div>
        <span style={styles.tag("#eef2ff")}>✓ {recommendation}</span>
        <span style={styles.tag("#f0fdf4")}>Max {useRoth ? "$7,000" : "$23,000"}/yr</span>
      </div>
    </div>
  );
}

function DebtCard({ advice }) {
  return (
    <div style={styles.card}>
      <div style={styles.cardTitle}>Debt Management</div>
      <p style={styles.blurb}>{advice}</p>
    </div>
  );
}

function GoalsCard({ goal }) {
  return (
    <div style={styles.card}>
      <div style={styles.cardTitle}>Short &amp; Long Term Goals</div>
      <div style={styles.row}>
        <span style={styles.rowLabel}>Your goal</span>
        <span style={styles.rowValue}>{goal}</span>
      </div>
      <div style={styles.row}>
        <span style={styles.rowLabel}>Savings target</span>
        <span style={{ ...styles.rowValue, color: "#aaa" }}>— set a target</span>
      </div>
      <div style={styles.row}>
        <span style={styles.rowLabel}>Timeline</span>
        <span style={{ ...styles.rowValue, color: "#aaa" }}>— set a timeline</span>
      </div>
    </div>
  );
}

function NextStepsCard({ items }) {
  return (
    <div style={{ ...styles.card, gridColumn: "1 / -1" }}>
      <div style={styles.cardTitle}>Next Steps</div>
      <ul style={styles.checklist}>
        {items.map((s, i) => (
          <li key={i} style={styles.checkItem}>
            <div style={styles.checkBox} />
            {s}
          </li>
        ))}
      </ul>
    </div>
  );
}

// ── page ──────────────────────────────────────────────────────────────────────

export default function Dashboard() {
  const { user } = useAuth();
  const userId = user?.id;

  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) return;
    fetchDashboard(userId)
      .then(setData)
      .catch((err) => setError(err.message));
  }, [userId]);

  if (error === "NO_PACKAGE") {
    return (
      <div style={styles.noPackage}>
        <p style={{ color: "#555", fontSize: "1rem" }}>
          You haven't created your financial plan yet.
        </p>
        <Link to="/about-you" style={styles.ctaLink}>Create My Plan →</Link>
      </div>
    );
  }

  if (error) return <div style={styles.error}>Failed to load dashboard: {error}</div>;
  if (!data)  return <div style={styles.loading}>Loading your financial package…</div>;

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h1 style={styles.headerTitle}>Your Financial Package</h1>
        <p style={styles.headerSub}>Hello, {data.name} — here's your personalized plan.</p>
        {data.summary && <div style={styles.summary}>{data.summary}</div>}
      </div>

      <div style={styles.grid}>
        <CashFlowCard data={data} />
        <SpendingPlanCard plan={data.spending_plan} />
        <EmergencyFundCard fund={data.emergency_fund} />
        <RetirementCard recommendation={data.retirement_recommendation} />
        <DebtCard advice={data.debt_advice} />
        <GoalsCard goal={data.goal} />
        <NextStepsCard items={data.action_items} />
      </div>
    </div>
  );
}
