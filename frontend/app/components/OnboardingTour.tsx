"use client";

import { useState, useEffect, useCallback } from "react";

type TourStep = {
  id: string;
  title: string;
  body: string;
  icon: string;
  position: "center" | "bottom-left" | "bottom-right" | "top-right";
  highlight?: string; // CSS selector to highlight (future use)
};

const TOUR_STEPS: TourStep[] = [
  {
    id: "welcome",
    title: "Welcome to RepoMind",
    body: "Understand any GitHub codebase in minutes. Paste a repo URL, ask natural language questions, and get answers cited down to the exact file and line.",
    icon: "✦",
    position: "center",
  },
  {
    id: "index",
    title: "Step 1 — Index a repository",
    body: "Paste any public GitHub URL into the sidebar. RepoMind will clone it, chunk every file into semantic segments, and build a searchable vector index — usually in under 30 seconds.",
    icon: "⬡",
    position: "bottom-left",
  },
  {
    id: "ask",
    title: "Step 2 — Ask anything",
    body: "Ask in plain English: "Where are the API routes defined?", "Explain the authentication flow", "Are there any potential race conditions?" — anything you'd ask a senior dev who knows the whole codebase.",
    icon: "◈",
    position: "center",
  },
  {
    id: "citations",
    title: "Step 3 — Trace every answer",
    body: "Every response surfaces the exact files and line ranges it reasoned from. Click any citation pill to jump straight to that file in the tree on the left. Verify, don't just trust.",
    icon: "⬟",
    position: "bottom-right",
  },
  {
    id: "done",
    title: "You're ready to explore",
    body: "Paste a repo URL in the sidebar to begin. We've pre-loaded some quick prompts to help you get started. Happy exploring.",
    icon: "◎",
    position: "center",
  },
];

const STORAGE_KEY = "repomind_tour_v1";

interface Props {
  onComplete: () => void;
}

export default function OnboardingTour({ onComplete }: Props) {
  const [step, setStep] = useState(0);
  const [exiting, setExiting] = useState(false);
  const current = TOUR_STEPS[step];
  const isLast = step === TOUR_STEPS.length - 1;

  const advance = useCallback(() => {
    if (isLast) {
      handleComplete();
    } else {
      setExiting(true);
      setTimeout(() => {
        setStep((s) => s + 1);
        setExiting(false);
      }, 200);
    }
  }, [isLast]);

  const handleComplete = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, "done");
    onComplete();
  }, [onComplete]);

  const handleSkip = useCallback(() => {
    handleComplete();
  }, [handleComplete]);

  // Keyboard nav
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === "ArrowRight") advance();
      if (e.key === "Escape") handleSkip();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [advance, handleSkip]);

  const positions: Record<string, React.CSSProperties> = {
    center: { left: "50%", top: "50%", transform: "translate(-50%, -50%)" },
    "bottom-left": { left: "340px", bottom: "80px" },
    "bottom-right": { right: "32px", bottom: "80px" },
    "top-right": { right: "32px", top: "80px" },
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "rgba(8, 11, 18, 0.88)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
      }}
      className="fadeIn"
    >
      {/* Decorative ambient orbs */}
      <div style={{
        position: "absolute", top: "20%", left: "15%",
        width: 300, height: 300,
        background: "radial-gradient(circle, rgba(245,158,11,0.07) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", bottom: "20%", right: "20%",
        width: 250, height: 250,
        background: "radial-gradient(circle, rgba(34,211,238,0.05) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      {/* Step card */}
      <div
        key={step}
        className="tour-step-card"
        style={{
          position: "absolute",
          ...positions[current.position],
          width: 460,
          background: "linear-gradient(145deg, #0d1117 0%, #111827 100%)",
          border: "1px solid rgba(245,158,11,0.25)",
          borderRadius: 20,
          padding: "36px 36px 28px",
          boxShadow: "0 24px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(245,158,11,0.12), inset 0 1px 0 rgba(255,255,255,0.04)",
          opacity: exiting ? 0 : 1,
          transform: exiting ? "scale(0.96) translateY(6px)" : undefined,
          transition: "opacity 0.18s ease, transform 0.18s ease",
        }}
      >
        {/* Progress bar */}
        <div style={{ display: "flex", gap: 5, marginBottom: 28 }}>
          {TOUR_STEPS.map((_, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                height: 3,
                borderRadius: 10,
                background: i <= step ? "var(--amber)" : "var(--border)",
                transition: "background 0.3s ease",
                overflow: "hidden",
              }}
            >
              {i === step && (
                <div className="progress-fill" style={{ height: "100%" }} />
              )}
            </div>
          ))}
        </div>

        {/* Icon */}
        <div style={{
          width: 52, height: 52,
          borderRadius: 14,
          background: "var(--amber-soft)",
          border: "1px solid rgba(245,158,11,0.2)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 24,
          color: "var(--amber)",
          marginBottom: 20,
          boxShadow: "0 0 20px rgba(245,158,11,0.1)",
        }} className="tour-highlight">
          {current.icon}
        </div>

        {/* Step count */}
        <div style={{
          fontSize: 11, fontWeight: 600, letterSpacing: "0.1em",
          textTransform: "uppercase", color: "var(--amber)",
          marginBottom: 8, opacity: 0.8,
        }}>
          {step + 1} / {TOUR_STEPS.length}
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
          fontSize: 14, color: "var(--text-muted)", lineHeight: 1.75,
          marginBottom: 32,
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

          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            {step > 0 && (
              <button
                onClick={() => { setExiting(true); setTimeout(() => { setStep(s => s - 1); setExiting(false); }, 180); }}
                className="btn btn-ghost"
                style={{ padding: "8px 16px", fontSize: 13 }}
              >
                Back
              </button>
            )}
            <button
              onClick={advance}
              className="btn btn-primary"
              style={{ padding: "10px 24px", fontSize: 14 }}
            >
              {isLast ? "Get started →" : "Continue →"}
            </button>
          </div>
        </div>

        {/* Keyboard hint */}
        <div style={{
          marginTop: 20, paddingTop: 16,
          borderTop: "1px solid var(--border)",
          display: "flex", gap: 16,
          color: "var(--text-dim)", fontSize: 11,
        }}>
          <span><kbd style={{ fontFamily: "var(--font-mono)", fontSize: 10, background: "var(--surface-high)", border: "1px solid var(--border)", borderRadius: 4, padding: "1px 5px" }}>Enter</kbd> continue</span>
          <span><kbd style={{ fontFamily: "var(--font-mono)", fontSize: 10, background: "var(--surface-high)", border: "1px solid var(--border)", borderRadius: 4, padding: "1px 5px" }}>Esc</kbd> skip</span>
        </div>
      </div>
    </div>
  );
}

export function shouldShowTour(): boolean {
  if (typeof window === "undefined") return false;
  return !localStorage.getItem(STORAGE_KEY);
}
