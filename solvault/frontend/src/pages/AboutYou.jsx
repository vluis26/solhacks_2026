import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { submitOnboarding } from "../api";

// ── questions ─────────────────────────────────────────────────────────────────

const STEPS = [
  {
    key: "name",
    question: "What's your name?",
    type: "text",
    placeholder: "Maria",
  },
  {
    key: "householdSize",
    question: "How many people are in your household?",
    type: "number",
    placeholder: "4",
  },
  {
    key: "monthlyIncome",
    question: "About how much does your family bring in each month?",
    type: "number",
    placeholder: "3500",
    prefix: "$",
  },
  {
    key: "housing",
    question: "Do you rent or own your home? How much is that monthly payment?",
    type: "housing",
  },
  {
    key: "debt",
    question: "Do you have any debt?",
    type: "yesno",
  },
  {
    key: "savings",
    question: "Do you have any savings set aside right now?",
    type: "number",
    placeholder: "800",
    prefix: "$",
  },
  {
    key: "goal",
    question: "What's your biggest financial worry or goal right now?",
    type: "textarea",
    placeholder: "Save for my kids' future...",
  },
];

// ── styles ────────────────────────────────────────────────────────────────────

const s = {
  page: {
    maxWidth: "520px",
    margin: "0 auto",
    padding: "2rem 1.5rem",
    fontFamily: "sans-serif",
    minHeight: "80vh",
    display: "flex",
    flexDirection: "column",
    gap: "1.5rem",
  },
  progressTrack: {
    height: "6px",
    borderRadius: "3px",
    backgroundColor: "#e2e8f0",
  },
  progressBar: (pct) => ({
    height: "6px",
    borderRadius: "3px",
    backgroundColor: "#4F6C2A",
    width: pct + "%",
    transition: "width 0.25s ease",
  }),
  progressLabel: {
    fontSize: "0.8rem",
    color: "#888",
    textAlign: "right",
    marginTop: "0.25rem",
  },
  bubble: {
    display: "flex",
    gap: "0.9rem",
    alignItems: "flex-start",
  },
  avatar: {
    width: "42px",
    height: "42px",
    borderRadius: "50%",
    backgroundColor: "#4F6C2A",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 700,
    fontSize: "0.8rem",
    flexShrink: 0,
  },
  bubbleBody: {
    backgroundColor: "#f8f9ff",
    border: "1px solid #e2e8f0",
    borderRadius: "0 12px 12px 12px",
    padding: "0.9rem 1rem",
    flex: 1,
  },
  advisorName: {
    fontSize: "0.72rem",
    fontWeight: 700,
    color: "#4F6C2A",
    marginBottom: "0.3rem",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  },
  question: {
    fontSize: "1rem",
    color: "#1a1a2e",
    lineHeight: 1.5,
  },
  inputArea: {
    display: "flex",
    flexDirection: "column",
    gap: "0.75rem",
  },
  input: {
    padding: "0.75rem",
    border: "1px solid #ddd",
    borderRadius: "8px",
    fontSize: "1rem",
    width: "100%",
    boxSizing: "border-box",
  },
  textarea: {
    padding: "0.75rem",
    border: "1px solid #ddd",
    borderRadius: "8px",
    fontSize: "1rem",
    width: "100%",
    boxSizing: "border-box",
    resize: "vertical",
    minHeight: "80px",
    fontFamily: "sans-serif",
  },
  prefixWrap: {
    position: "relative",
    display: "flex",
    alignItems: "center",
  },
  prefix: {
    position: "absolute",
    left: "0.75rem",
    color: "#555",
    pointerEvents: "none",
  },
  prefixInput: {
    padding: "0.75rem 0.75rem 0.75rem 1.5rem",
    border: "1px solid #ddd",
    borderRadius: "8px",
    fontSize: "1rem",
    width: "100%",
    boxSizing: "border-box",
  },
  btnRow: {
    display: "flex",
    gap: "0.75rem",
  },
  toggleBtn: (active) => ({
    flex: 1,
    padding: "0.75rem",
    border: active ? "2px solid #4F6C2A" : "2px solid #ddd",
    borderRadius: "8px",
    backgroundColor: active ? "#eef2ff" : "#fff",
    cursor: "pointer",
    fontSize: "1rem",
    fontWeight: active ? 600 : 400,
    color: active ? "#4F6C2A" : "#333",
  }),
  nav: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "0.75rem",
    marginTop: "auto",
    paddingTop: "0.5rem",
  },
  backBtn: {
    padding: "0.6rem 1.4rem",
    border: "1px solid #ddd",
    borderRadius: "6px",
    backgroundColor: "#fff",
    cursor: "pointer",
    fontSize: "0.95rem",
  },
  nextBtn: (disabled) => ({
    padding: "0.6rem 1.6rem",
    border: "none",
    borderRadius: "6px",
    backgroundColor: disabled ? "#a3b899" : "#4F6C2A",
    color: "#fff",
    cursor: disabled ? "not-allowed" : "pointer",
    fontSize: "0.95rem",
    fontWeight: 500,
  }),
  // Confirm screen
  confirmCard: {
    border: "1px solid #e2e8f0",
    borderRadius: "10px",
    padding: "1.5rem",
    backgroundColor: "#fff",
  },
  confirmTitle: {
    fontSize: "1.2rem",
    fontWeight: 700,
    marginBottom: "1rem",
  },
  confirmRow: {
    display: "flex",
    justifyContent: "space-between",
    padding: "0.4rem 0",
    borderBottom: "1px solid #f1f5f9",
    fontSize: "0.95rem",
  },
  confirmLabel: { color: "#555" },
  confirmValue: { fontWeight: 500, maxWidth: "55%", textAlign: "right" },
  submitBtn: {
    padding: "0.75rem",
    backgroundColor: "#4F6C2A",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "1rem",
    fontWeight: 500,
    width: "100%",
  },
  errorMsg: {
    color: "#e53e3e",
    fontSize: "0.9rem",
    textAlign: "center",
  },
};

// ── confirm screen ────────────────────────────────────────────────────────────

function ConfirmScreen({ answers, onBack, onSubmit, submitting, error }) {
  const rows = [
    { label: "Name", value: answers.name },
    { label: "Household size", value: `${answers.householdSize} people` },
    { label: "Monthly income", value: `$${answers.monthlyIncome}` },
    { label: "Housing", value: `${answers.housingType === "rent" ? "Renting" : "Owns home"} · $${answers.housingPayment}/mo` },
    { label: "Debt", value: answers.debt === "yes" ? (answers.debtType || "Yes") : "None" },
    { label: "Savings", value: `$${answers.savings}` },
    { label: "Goal", value: answers.goal },
  ];

  return (
    <div style={s.page}>
      <div style={s.bubble}>
        <div style={s.avatar}>FS</div>
        <div style={s.bubbleBody}>
          <div style={s.advisorName}>FuturoSeguro</div>
          <div style={s.question}>Here's what I have — does everything look right?</div>
        </div>
      </div>

      <div style={s.confirmCard}>
        <div style={s.confirmTitle}>Your answers</div>
        {rows.map((r) => (
          <div key={r.label} style={s.confirmRow}>
            <span style={s.confirmLabel}>{r.label}</span>
            <span style={s.confirmValue}>{r.value}</span>
          </div>
        ))}
      </div>

      {error && <div style={s.errorMsg}>{error}</div>}

      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        <button style={s.submitBtn} onClick={onSubmit} disabled={submitting}>
          {submitting ? "Generating your plan…" : "Generate My Plan →"}
        </button>
        <button style={{ ...s.backBtn, width: "100%", textAlign: "center" }} onClick={onBack}>
          Go back and edit
        </button>
      </div>
    </div>
  );
}

// ── main component ────────────────────────────────────────────────────────────

export default function AboutYou() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({
    name: "",
    householdSize: "",
    monthlyIncome: "",
    housingType: "",
    housingPayment: "",
    debt: "",
    debtType: "",
    savings: "",
    goal: "",
  });
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const current = STEPS[step];
  const total = STEPS.length;

  function set(key, value) {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  }

  function canAdvance() {
    switch (current.key) {
      case "name":         return answers.name.trim() !== "";
      case "householdSize": return answers.householdSize !== "";
      case "monthlyIncome": return answers.monthlyIncome !== "";
      case "housing":      return answers.housingType !== "" && answers.housingPayment !== "";
      case "debt":         return answers.debt !== "";
      case "savings":      return answers.savings !== "";
      case "goal":         return answers.goal.trim() !== "";
      default:             return true;
    }
  }

  function handleNext() {
    if (step < total - 1) setStep(step + 1);
    else setShowConfirm(true);
  }

  function handleBack() {
    if (step > 0) setStep(step - 1);
  }

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);
    try {
      await submitOnboarding(answers);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
      setSubmitting(false);
    }
  }

  if (showConfirm) {
    return (
      <ConfirmScreen
        answers={answers}
        onBack={() => setShowConfirm(false)}
        onSubmit={handleSubmit}
        submitting={submitting}
        error={error}
      />
    );
  }

  // ── input rendering ──────────────────────────────────────────────────────

  function renderInput() {
    switch (current.type) {
      case "text":
        return (
          <input
            style={s.input}
            type="text"
            placeholder={current.placeholder}
            value={answers[current.key]}
            onChange={(e) => set(current.key, e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && canAdvance() && handleNext()}
            autoFocus
          />
        );

      case "number":
        return current.prefix ? (
          <div style={s.prefixWrap}>
            <span style={s.prefix}>{current.prefix}</span>
            <input
              style={s.prefixInput}
              type="number"
              placeholder={current.placeholder}
              value={answers[current.key]}
              onChange={(e) => set(current.key, e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && canAdvance() && handleNext()}
              autoFocus
              min="0"
            />
          </div>
        ) : (
          <input
            style={s.input}
            type="number"
            placeholder={current.placeholder}
            value={answers[current.key]}
            onChange={(e) => set(current.key, e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && canAdvance() && handleNext()}
            autoFocus
            min="1"
          />
        );

      case "textarea":
        return (
          <textarea
            style={s.textarea}
            placeholder={current.placeholder}
            value={answers[current.key]}
            onChange={(e) => set(current.key, e.target.value)}
            autoFocus
          />
        );

      case "housing":
        return (
          <>
            <div style={s.btnRow}>
              <button style={s.toggleBtn(answers.housingType === "rent")} onClick={() => set("housingType", "rent")}>
                Rent
              </button>
              <button style={s.toggleBtn(answers.housingType === "own")} onClick={() => set("housingType", "own")}>
                Own
              </button>
            </div>
            {answers.housingType && (
              <div style={s.prefixWrap}>
                <span style={s.prefix}>$</span>
                <input
                  style={s.prefixInput}
                  type="number"
                  placeholder="1200"
                  value={answers.housingPayment}
                  onChange={(e) => set("housingPayment", e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && canAdvance() && handleNext()}
                  autoFocus
                  min="0"
                />
              </div>
            )}
          </>
        );

      case "yesno":
        return (
          <>
            <div style={s.btnRow}>
              <button style={s.toggleBtn(answers.debt === "yes")} onClick={() => set("debt", "yes")}>
                Yes
              </button>
              <button style={s.toggleBtn(answers.debt === "no")} onClick={() => set("debt", "no")}>
                No
              </button>
            </div>
            {answers.debt === "yes" && (
              <input
                style={s.input}
                type="text"
                placeholder="e.g. car loan, credit card"
                value={answers.debtType}
                onChange={(e) => set("debtType", e.target.value)}
                autoFocus
              />
            )}
          </>
        );

      default:
        return null;
    }
  }

  // ── render ────────────────────────────────────────────────────────────────

  return (
    <div style={s.page}>
      <div>
        <div style={s.progressTrack}>
          <div style={s.progressBar(((step + 1) / total) * 100)} />
        </div>
        <div style={s.progressLabel}>Question {step + 1} of {total}</div>
      </div>

      <div style={s.bubble}>
        <div style={s.avatar}>FS</div>
        <div style={s.bubbleBody}>
          <div style={s.advisorName}>FuturoSeguro</div>
          <div style={s.question}>{current.question}</div>
        </div>
      </div>

      <div style={s.inputArea}>{renderInput()}</div>

      <div style={s.nav}>
        {step > 0 && (
          <button style={s.backBtn} onClick={handleBack}>Back</button>
        )}
        <button
          style={s.nextBtn(!canAdvance())}
          onClick={handleNext}
          disabled={!canAdvance()}
        >
          {step === total - 1 ? "Review" : "Next"}
        </button>
      </div>
    </div>
  );
}
