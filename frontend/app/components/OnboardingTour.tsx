"use client";

import { useState, useEffect, useCallback } from "react";

type TourStep = {
  id: string;
  title: string;
  body: string;
  icon: string;
};

const TOUR_STEPS: TourStep[] = [
  {
    id: "welcome",
    title: "Welcome to RepoMind",
    body: "Understand any GitHub codebase in minutes. Paste a repo URL, ask natural language questions, and get answers cited down to the exact file and line.",
    icon: "✦",
  },
  {
    id: "index",
    title: "Step 1 — Index a repository",
    body: "Paste any public GitHub URL into the sidebar on the left. RepoMind clones it, chunks every file into semantic segments, and builds a searchable vector index — usually under 30 seconds.",
    icon: "⬡",
  },
  {
    id: "ask",
    title: "Step 2 — Ask anything",
    body: "Ask in plain English: 'Where are the API routes defined?', 'Explain the auth flow', 'Any race conditions?' — anything you would ask a senior dev who knows the whole codebase.",
    icon: "◈",
  },
  {
    id: "citations",
    title: "Step 3 — Trace every answer",
    body: "Every response shows the exact files and line ranges it used. Click any citation pill to jump straight to that file in the tree. Verify, don't just trust.",
    icon: "⬟",
  },
  {
    id: "done",
    title: "You are ready to explore",
    body: "Paste a GitHub repo URL in the sidebar to get started. Quick prompts will appear once your repo is indexed. Happy exploring.",
    icon: "◎",
  },
];

const STORAGE_KEY = "repomind_tour_v1";

export default function OnboardingTour({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState(0);
  const [animState, setAnimState] = useState<"in" | "out">("in");

  const current = TOUR_STEPS[step];
  const isLast = step === TOUR_STEPS.length - 1;

  const goTo = useCallback((next: number) => {
    setAnimState("out");
    setTimeout(() => {
      setStep(next);
      setAnimState("in");
    }, 180);
  }, []);

  const advance = useCallback(() => {
    if (isLast) {
      localStorage.setItem(STORAGE_KEY, "done");
      onComplete();
    } else {
      goTo(step + 1);
    }
  }, [isLast, step, goTo, onComplete]);

  const handleSkip = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, "done");
    onComplete();
  }, [onComplete]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === "ArrowRight") advance();
      if (e.key === "ArrowLeft" && step > 0) goTo(step - 1);
      if (e.key === "Escape") handleSkip();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [advance, handleSkip, goTo, step]);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(8, 11, 18, 0.85)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        padding: 20,
      }}
      onClick={(e) => { if (e.target === e.currentTarget) handleSkip(); }}
    >
      {/* Ambient orbs */}
      <div style={{
        position: "absolute", top: "15%", left: "10%",
        width: 400, height: 400, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(245,158,11,0.06) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", bottom: "15%", right: "10%",
        width: 300, height: 300, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(34,211,238,0.05) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      {/* Modal card */}
      <div
        key={step}
        style={{
          width: "100%",
          maxWidth: 480,
          background: "linear-gradient(145deg, #0d1117 0%, #111827 100%)",
          border: "1px solid rgba(245,158,11,0.2)",
          borderRadius: 24,
          padding: "40px 40px 32px",
          boxShadow: "0 32px 100px rgba(0,0,0,0.8), 0 0 0 1px rgba(245,158,11,0.08), inset 0 1px 0 rgba(255,255,255,0.04)",
          opacity: animState === "in" ? 1 : 0,
          transform: animState === "in" ? "scale(1) translateY(0)" : "scale(0.97) translateY(8px)",
          transition: "opacity 0.2s ease, transform 0.2s ease",
          position: "relative",
        }}
      >
        {/* Progress dots */}
        <div style={{ display: "flex", gap: 6, marginBottom: 32, alignItems: "center" }}>
          {TOUR_STEPS.map((_, i) => (
            <button
              key={i}
              onClick={() => i < step ? goTo(i) : undefined}
              style={{
                width: i === step ? 24 : 7,
                height: 7,
                borderRadius: 10,
                background: i === step ? "var(--amber)" : i < step ? "rgba(245,158,11,0.4)" : "var(--border)",
                border: "none",
                cursor: i < step ? "pointer" : "default",
                padding: 0,
                transition: "all 0.3s cubic-bezier(.22,1,.36,1)",
                flexShrink: 0,
              }}
            />
          ))}
          <span style={{
            marginLeft: "auto",
            fontSize: 11, color: "var(--text-dim)", fontWeight: 500,
            fontFamily: "var(--font-mono)",
          }}>
            {step + 1} / {TOUR_STEPS.length}
          </span>
        </div>

        {/* Icon */}
        <div style={{
          width: 56, height: 56, borderRadius: 16,
          background: "var(--amber-soft)",
          border: "1px solid rgba(245,158,11,0.25)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 26, color: "var(--amber)",
          marginBottom: 24,
          boxShadow: "0 0 24px rgba(245,158,11,0.12)",
        }}>
          {current.icon}
        </div>

        {/* Title */}
        <h2 style={{
          fontSize: 22, fontWeight: 700, color: "var(--text)",
          marginBottom: 12, lineHeight: 1.3,
          letterSpacing: "-0.02em",
        }}>
          {current.title}
        </h2>

        {/* Body */}
        <p style={{
          fontSize: 14, color: "var(--text-muted)", lineHeight: 1.8,
          marginBottom: 36,
        }}>
          {current.body}
        </p>

        {/* Actions */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <button
            onClick={handleSkip}
            style={{
              background: "transparent", border: "none",
              color: "var(--text-dim)", fontSize: 12, fontWeight: 500,
              cursor: "pointer", fontFamily: "inherit", padding: "4px 0",
              transition: "color 0.15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-dim)")}
          >
            Skip tour
          </button>

          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {step > 0 && (
              <button
                onClick={() => goTo(step - 1)}
                className="btn btn-ghost"
                style={{ padding: "9px 18px", fontSize: 13 }}
              >
                ← Back
              </button>
            )}
            <button
              onClick={advance}
              className="btn btn-primary"
              style={{ padding: "10px 26px", fontSize: 14 }}
            >
              {isLast ? "Get started →" : "Continue →"}
            </button>
          </div>
        </div>

        {/* Keyboard hints */}
        <div style={{
          marginTop: 24, paddingTop: 16,
          borderTop: "1px solid var(--border)",
          display: "flex", gap: 16,
          color: "var(--text-dim)", fontSize: 11,
        }}>
          {[["Enter", "continue"], ["←→", "navigate"], ["Esc", "skip"]].map(([key, label]) => (
            <span key={key}>
              <kbd style={{
                fontFamily: "var(--font-mono)", fontSize: 10,
                background: "var(--surface-high)", border: "1px solid var(--border)",
                borderRadius: 4, padding: "1px 6px", marginRight: 4,
              }}>{key}</kbd>
              {label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export function shouldShowTour(): boolean {
  if (typeof window === "undefined") return false;
  return !localStorage.getItem(STORAGE_KEY);
}
