"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useAuth, useClerk } from "@clerk/nextjs";
import FileTree, { TraceTarget } from "./components/FileTree";
import OnboardingTour, { shouldShowTour } from "./components/OnboardingTour";
import LandingPage from "./components/LandingPage";
import { trackEvent } from "./components/PostHogProvider";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const QUICK_PROMPTS = [
  "Where are the API endpoints defined?",
  "Explain the folder structure and architecture.",
  "Are there any obvious security or architectural issues?",
  "What is the data flow from request to response?",
];

const PIPELINE_STEPS = [
  { id: "clone", label: "Clone", desc: "Fetching repository" },
  { id: "chunk", label: "Chunk", desc: "Splitting into segments" },
  { id: "embed", label: "Embed", desc: "Building vector index" },
  { id: "ready", label: "Ready", desc: "Index complete" },
];

type Citation = { file_path: string; start_line: number; end_line: number };
type Message = { role: "user" | "assistant"; content: string; citations?: Citation[] };

export default function Home() {
  const { getToken, isSignedIn, isLoaded } = useAuth();
  const { openSignIn } = useClerk();

  async function authHeaders(): Promise<Record<string, string>> {
    const token = await getToken().catch(() => null);
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  const [repoUrl, setRepoUrl] = useState("");
  const [repoId, setRepoId] = useState<string | null>(null);
  const [chunksIndexed, setChunksIndexed] = useState<number | null>(null);
  const [ingestStatus, setIngestStatus] = useState<"idle" | "processing" | "ready" | "failed">("idle");
  const [ingestError, setIngestError] = useState<string | null>(null);
  const [traceTarget, setTraceTarget] = useState<TraceTarget>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [question, setQuestion] = useState("");
  const [asking, setAsking] = useState(false);
  const [showTour, setShowTour] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [fileTreeOpen, setFileTreeOpen] = useState(true);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const chatInputRef = useRef<HTMLInputElement>(null);

  // Show tour for first-time signed-in users only
  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;
    const timer = setTimeout(() => {
      if (shouldShowTour()) setShowTour(true);
    }, 800);
    return () => clearTimeout(timer);
  }, [isSignedIn, isLoaded]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => () => { if (pollRef.current) clearInterval(pollRef.current); }, []);

  // Auto-close sidebar and file tree on mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
        setFileTreeOpen(false);
      } else {
        setSidebarOpen(true);
        setFileTreeOpen(true);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  function pollStatus(id: string) {
    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch(`${API_URL}/repo/status/${id}`);
        const data = await res.json();
        if (data.status === "ready") {
          setIngestStatus("ready");
          setChunksIndexed(data.chunks_indexed);
          if (pollRef.current) clearInterval(pollRef.current);
          setTimeout(() => chatInputRef.current?.focus(), 300);
        } else if (data.status === "failed") {
          setIngestStatus("failed");
          setIngestError(data.error || "Ingestion failed");
          if (pollRef.current) clearInterval(pollRef.current);
        }
      } catch { /* transient */ }
    }, 2000);
  }

  async function handleIngest() {
    if (!repoUrl.trim()) return;
    if (!isSignedIn) { openSignIn(); return; }
    setIngestStatus("processing");
    setIngestError(null);
    setRepoId(null);
    setChunksIndexed(null);
    setMessages([]);
    if (pollRef.current) clearInterval(pollRef.current);
    try {
      const res = await fetch(`${API_URL}/repo/ingest`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(await authHeaders()) },
        body: JSON.stringify({ repo_url: repoUrl.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Failed to start indexing");
      setRepoId(data.repo_id);
      trackEvent("repo_ingest_started", { repo_url: repoUrl.trim() });
      pollStatus(data.repo_id);
    } catch (err) {
      setIngestStatus("failed");
      setIngestError(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  const handleAsk = useCallback(async (overrideQuestion?: string) => {
    const q = (overrideQuestion ?? question).trim();
    if (!q || !repoId) return;
    setMessages((prev) => [...prev, { role: "user", content: q }]);
    setQuestion("");
    setAsking(true);
    try {
      const res = await fetch(`${API_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(await authHeaders()) },
        body: JSON.stringify({ repo_id: repoId, question: q }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Failed to get an answer");
      trackEvent("question_asked", { repo_id: repoId });
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.answer, citations: data.citations },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: err instanceof Error ? `Error: ${err.message}` : "Something went wrong." },
      ]);
    } finally {
      setAsking(false);
    }
  }, [question, repoId]);

  function traceToFile(path: string) {
    setTraceTarget({ path, key: Date.now() });
  }

  // Show loading state briefly while Clerk loads
  if (!isLoaded) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "calc(100vh - 52px)" }}>
        <div className="spin-ring" style={{ width: 24, height: 24, borderWidth: 2 }} />
      </div>
    );
  }

  // Non-signed-in users see the landing page
  if (!isSignedIn) {
    return <LandingPage />;
  }

  // ── Signed-in: full app ──
  const currentStepIndex =
    ingestStatus === "processing" ? 1 :
    ingestStatus === "ready"     ? 3 : -1;

  const repoName = repoUrl.trim().replace(/\/$/, "").split("/").slice(-2).join("/");

  return (
    <>
      {showTour && <OnboardingTour onComplete={() => setShowTour(false)} />}

      <div style={{
        display: "flex",
        height: "calc(100vh - 52px)",
        overflow: "hidden",
        flexDirection: "row",
      }}>

        {/* ── Sidebar Overlay (Mobile) ── */}
        {sidebarOpen && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              top: 52,
              background: "rgba(0,0,0,0.5)",
              zIndex: 40,
              display: "none",
            }}
            className="sidebar-overlay-mobile"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* ── Sidebar ── */}
        <aside style={{
          width: sidebarOpen ? "clamp(280px, 100vw, 300px)" : 0,
          minWidth: sidebarOpen ? "clamp(280px, 100vw, 300px)" : 0,
          borderRight: "1px solid var(--border)",
          display: "flex",
          flexDirection: "column",
          background: "var(--surface)",
          overflow: "hidden",
          transition: "width 0.25s cubic-bezier(.22,1,.36,1), min-width 0.25s cubic-bezier(.22,1,.36,1)",
          flexShrink: 0,
          position: "relative",
          zIndex: 41,
        }}>
          <div style={{
            padding: "clamp(14px, 3vw, 20px)",
            display: "flex",
            flexDirection: "column",
            gap: "clamp(10px, 2vw, 14px)",
            height: "100%",
            overflow: "hidden",
          }}>

            <div style={{ display: "flex", flexDirection: "column", gap: "clamp(4px, 1vw, 6px)" }}>
              <label style={{
                fontSize: "clamp(10px, 2vw, 11px)",
                fontWeight: 600,
                color: "var(--text-dim)",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}>
                Repository URL
              </label>
              <div style={{ position: "relative" }}>
                <span style={{
                  position: "absolute",
                  left: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "var(--text-dim)",
                  fontSize: "clamp(12px, 2vw, 14px)",
                  pointerEvents: "none",
                }}>⬡</span>
                <input
                  className={`input-base ${ingestStatus === "processing" ? "input-processing" : ""}`}
                  style={{
                    paddingLeft: 34,
                    fontSize: "clamp(12px, 2vw, 14px)",
                  }}
                  placeholder="https://github.com/owner/repo"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleIngest()}
                />
              </div>
            </div>

            <button
              className="btn btn-primary"
              style={{
                width: "100%",
                fontSize: "clamp(12px, 2vw, 14px)",
                padding: "clamp(10px, 2vw, 11px) clamp(14px, 3vw, 16px)",
                borderRadius: 10,
                justifyContent: "center",
                gap: 8,
              }}
              onClick={handleIngest}
              disabled={ingestStatus === "processing" || !repoUrl.trim()}
            >
              {ingestStatus === "processing" ? (
                <><span className="spin-ring" />Indexing…</>
              ) : (
                <><span>⬡</span> Index repository</>
              )}
            </button>

            {ingestStatus === "failed" && ingestError && (
              <div className="fadeUp" style={{
                background: "rgba(248,113,113,0.08)",
                border: "1px solid rgba(248,113,113,0.2)",
                borderRadius: 10,
                padding: "clamp(10px, 2vw, 11px) clamp(12px, 2vw, 14px)",
                color: "var(--error)",
                fontSize: "clamp(11px, 2vw, 12px)",
                lineHeight: 1.5,
              }}>
                <strong>Indexing failed</strong><br />{ingestError}
              </div>
            )}

            {ingestStatus === "ready" && chunksIndexed !== null && (
              <div className="success-pop" style={{
                background: "var(--amber-soft)",
                border: "1px solid rgba(245,158,11,0.2)",
                borderRadius: 10,
                padding: "clamp(10px, 2vw, 12px) clamp(12px, 2vw, 14px)",
                display: "flex",
                alignItems: "center",
                gap: "clamp(8px, 2vw, 10px)",
              }}>
                <div style={{
                  width: "clamp(28px, 5vw, 32px)",
                  height: "clamp(28px, 5vw, 32px)",
                  borderRadius: 8,
                  background: "rgba(245,158,11,0.15)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--amber)",
                  fontSize: "clamp(14px, 3vw, 16px)",
                  flexShrink: 0,
                }}>◎</div>
                <div style={{ minWidth: 0 }}>
                  <div style={{
                    fontSize: "clamp(12px, 2vw, 13px)",
                    fontWeight: 600,
                    color: "var(--amber)",
                  }}>Index ready</div>
                  <div style={{
                    fontSize: "clamp(10px, 2vw, 11px)",
                    color: "var(--text-muted)",
                    marginTop: 1,
                  }}>{chunksIndexed.toLocaleString()} chunks indexed</div>
                </div>
              </div>
            )}

            <div style={{
              background: "var(--surface-raised)",
              border: "1px solid var(--border)",
              borderRadius: 12,
              padding: "clamp(12px, 2vw, 14px) clamp(14px, 3vw, 16px)",
              display: "flex",
              flexDirection: "column",
              gap: "clamp(10px, 2vw, 12px)",
            }}>
              <div style={{
                fontSize: "clamp(9px, 2vw, 10px)",
                fontWeight: 600,
                color: "var(--text-dim)",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
              }}>Pipeline</div>
              {PIPELINE_STEPS.map((s, i) => {
                const isDone = ingestStatus === "ready" || (ingestStatus === "processing" && i < currentStepIndex);
                const isActive = ingestStatus === "processing" && i === Math.min(currentStepIndex, 2);
                return (
                  <div key={s.id} style={{ display: "flex", alignItems: "center", gap: "clamp(8px, 2vw, 10px)" }}>
                    <div className={`pipeline-dot ${isActive ? "pipeline-dot-active" : ""}`} style={{
                      background: isDone ? "var(--amber)" : isActive ? "var(--amber)" : "var(--border)",
                    }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontSize: "clamp(11px, 2vw, 12px)",
                        fontWeight: 500,
                        color: isDone || isActive ? "var(--text)" : "var(--text-dim)",
                        fontFamily: "var(--font-mono)",
                      }}>
                        {i + 1}. {s.label}
                      </div>
                      {isActive && <div className="fadeIn" style={{
                        fontSize: "clamp(9px, 2vw, 10px)",
                        color: "var(--amber)",
                        marginTop: 1,
                      }}>{s.desc}…</div>}
                    </div>
                    {isDone && <span style={{ color: "var(--amber)", fontSize: "clamp(11px, 2vw, 12px)" }}>✓</span>}
                  </div>
                );
              })}
            </div>

            <div style={{ marginTop: "auto" }}>
              <button
                onClick={() => setShowTour(true)}
                style={{
                  background: "transparent",
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                  padding: "clamp(7px, 1.5vw, 8px) clamp(12px, 2vw, 14px)",
                  color: "var(--text-muted)",
                  fontSize: "clamp(11px, 2vw, 12px)",
                  fontWeight: 500,
                  width: "100%",
                  fontFamily: "inherit",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  transition: "border-color 0.15s, color 0.15s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "var(--amber)";
                  e.currentTarget.style.color = "var(--amber)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "var(--border)";
                  e.currentTarget.style.color = "var(--text-muted)";
                }}
              >
                ◎ Show tour
              </button>
            </div>
          </div>
        </aside>

        {/* ── File tree ── */}
        {ingestStatus === "ready" && repoId && fileTreeOpen && (
          <nav className="fadeIn" style={{
            width: "clamp(200px, 100vw, 220px)",
            flexShrink: 0,
            borderRight: "1px solid var(--border)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            background: "var(--bg)",
            position: "relative",
            zIndex: 39,
          }}>
            <div style={{
              padding: "clamp(10px, 2vw, 12px) clamp(12px, 2vw, 14px)",
              borderBottom: "1px solid var(--border)",
              display: "flex",
              alignItems: "center",
              gap: 8,
              justifyContent: "space-between",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                <span style={{ color: "var(--amber)", fontSize: "clamp(10px, 2vw, 12px)", flexShrink: 0 }}>⬡</span>
                <span style={{
                  fontSize: "clamp(9px, 2vw, 10px)",
                  fontWeight: 600,
                  color: "var(--text-muted)",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}>
                  {repoName || "Files"}
                </span>
              </div>
              <button
                onClick={() => setFileTreeOpen(false)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "var(--text-muted)",
                  cursor: "pointer",
                  fontSize: "clamp(12px, 2vw, 14px)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 24,
                  height: 24,
                  flexShrink: 0,
                }}
              >
                ✕
              </button>
            </div>
            <FileTree repoId={repoId} traceTarget={traceTarget} onFileClick={(path) => handleAsk(`Explain what this file does: ${path}`)} />
          </nav>
        )}

        {/* ── Chat ── */}
        <section style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          position: "relative",
        }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "clamp(8px, 2vw, 12px)",
            padding: "clamp(10px, 2vw, 12px)",
            position: "absolute",
            top: 0,
            left: 0,
            zIndex: 10,
          }}>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              style={{
                width: "clamp(26px, 6vw, 28px)",
                height: "clamp(26px, 6vw, 28px)",
                borderRadius: 7,
                background: "var(--surface-raised)",
                border: "1px solid var(--border)",
                color: "var(--text-muted)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "clamp(11px, 2vw, 12px)",
                cursor: "pointer",
                fontFamily: "inherit",
                transition: "border-color 0.15s, color 0.15s",
                flexShrink: 0,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "var(--border-bright)";
                e.currentTarget.style.color = "var(--text)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--border)";
                e.currentTarget.style.color = "var(--text-muted)";
              }}
            >
              {sidebarOpen ? "◁" : "▷"}
            </button>

            {ingestStatus === "ready" && repoId && (
              <button
                onClick={() => setFileTreeOpen(!fileTreeOpen)}
                style={{
                  width: "clamp(26px, 6vw, 28px)",
                  height: "clamp(26px, 6vw, 28px)",
                  borderRadius: 7,
                  background: "var(--surface-raised)",
                  border: "1px solid var(--border)",
                  color: "var(--text-muted)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "clamp(11px, 2vw, 12px)",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  transition: "border-color 0.15s, color 0.15s",
                  flexShrink: 0,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "var(--border-bright)";
                  e.currentTarget.style.color = "var(--text)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "var(--border)";
                  e.currentTarget.style.color = "var(--text-muted)";
                }}
              >
                {fileTreeOpen ? "◀" : "▶"}
              </button>
            )}
          </div>

          {messages.length === 0 && (
            <div style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "clamp(24px, 5vw, 48px)",
              overflow: "auto",
            }}>
              {ingestStatus === "ready" ? (
                <QuickPromptsPanel onSelect={handleAsk} repoName={repoName} />
              ) : (
                <HeroPanel />
              )}
            </div>
          )}

          {messages.length > 0 && (
            <div className="messages-scroll" style={{
              flex: 1,
              overflowY: "auto",
              padding: "clamp(16px, 3vw, 24px)",
              display: "flex",
              flexDirection: "column",
              gap: "clamp(14px, 3vw, 20px)",
              paddingTop: "clamp(50px, 8vw, 60px)",
            }}>
              {messages.map((m, i) => (
                <MessageBubble key={i} message={m} onCitationClick={traceToFile} />
              ))}
              {asking && <ThinkingBubble />}
              <div ref={chatEndRef} />
            </div>
          )}

          <div style={{
            padding: "clamp(10px, 2vw, 12px) clamp(14px, 3vw, 20px) clamp(12px, 2vw, 16px)",
            borderTop: "1px solid var(--border)",
            background: "var(--bg)",
          }}>
            <div
              style={{
                display: "flex",
                gap: "clamp(8px, 2vw, 10px)",
                alignItems: "center",
                background: "var(--surface)",
                border: "1.5px solid var(--border)",
                borderRadius: 14,
                padding: "clamp(5px, 1.5vw, 6px) clamp(5px, 1.5vw, 6px) clamp(5px, 1.5vw, 6px) clamp(12px, 2vw, 16px)",
                transition: "border-color 0.15s, box-shadow 0.15s",
              }}
              onFocusCapture={(e) => {
                const el = e.currentTarget as HTMLDivElement;
                el.style.borderColor = "var(--amber)";
                el.style.boxShadow = "0 0 0 3px var(--amber-soft)";
              }}
              onBlurCapture={(e) => {
                const el = e.currentTarget as HTMLDivElement;
                el.style.borderColor = "var(--border)";
                el.style.boxShadow = "none";
              }}
            >
              <input
                ref={chatInputRef}
                style={{
                  flex: 1,
                  background: "transparent",
                  border: "none",
                  outline: "none",
                  color: "var(--text)",
                  fontSize: "clamp(12px, 2vw, 14px)",
                  fontFamily: "inherit",
                  padding: "clamp(5px, 1.5vw, 6px) 0",
                  minWidth: 0,
                }}
                placeholder={ingestStatus === "ready" ? "Ask about this codebase…" : "Index a repository first"}
                value={question}
                disabled={ingestStatus !== "ready" || asking}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAsk()}
              />
              <button
                className="btn btn-primary"
                style={{
                  borderRadius: 10,
                  padding: "clamp(7px, 1.5vw, 8px) clamp(14px, 3vw, 18px)",
                  fontSize: "clamp(12px, 2vw, 13px)",
                  flexShrink: 0,
                }}
                onClick={() => handleAsk()}
                disabled={ingestStatus !== "ready" || asking || !question.trim()}
              >
                {asking ? <span className="spin-ring" style={{ width: 13, height: 13, borderWidth: 1.5 }} /> : "Ask →"}
              </button>
            </div>
            <div style={{
              textAlign: "center",
              marginTop: "clamp(6px, 1.5vw, 8px)",
              color: "var(--text-dim)",
              fontSize: "clamp(10px, 2vw, 11px)",
            }}>
              Every answer cites exact file and line references.
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

function HeroPanel() {
  return (
    <div className="fadeUp" style={{
      maxWidth: "clamp(260px, 90vw, 600px)",
      textAlign: "center",
      width: "100%",
    }}>
      <div style={{
        position: "relative",
        width: "clamp(60px, 12vw, 80px)",
        height: "clamp(60px, 12vw, 80px)",
        margin: "0 auto clamp(24px, 5vw, 32px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}>
        <div style={{
          width: "100%",
          height: "100%",
          borderRadius: "50%",
          border: "1.5px solid rgba(245,158,11,0.15)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}>
          <div style={{
            width: "70%",
            height: "70%",
            borderRadius: "50%",
            border: "1.5px solid rgba(245,158,11,0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}>
            <div style={{
              width: "60%",
              height: "60%",
              borderRadius: "50%",
              background: "var(--amber-soft)",
              border: "1px solid var(--amber)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--amber)",
              fontSize: "clamp(14px, 3vw, 16px)",
            }}>⬡</div>
          </div>
        </div>
        <div style={{ position: "absolute", inset: 0, animation: "spinRing 8s linear infinite" }}>
          <div style={{
            position: "absolute",
            top: 4,
            left: "50%",
            transform: "translateX(-50%)",
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: "var(--amber)",
            boxShadow: "0 0 8px rgba(245,158,11,0.8)",
          }} />
        </div>
      </div>
      <h1 style={{
        fontSize: "clamp(20px, 5vw, 28px)",
        fontWeight: 700,
        lineHeight: 1.2,
        marginBottom: "clamp(10px, 2vw, 12px)",
        letterSpacing: "-0.03em",
      }}>
        Understand any codebase<br /><span className="gold-shimmer">in minutes.</span>
      </h1>
      <p style={{
        fontSize: "clamp(12px, 2.5vw, 14px)",
        color: "var(--text-muted)",
        lineHeight: 1.75,
        marginBottom: "clamp(24px, 5vw, 36px)",
      }}>
        Paste a public GitHub URL in the sidebar to get started.
      </p>
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(clamp(140px, 90vw, 160px), 1fr))",
        gap: "clamp(10px, 2vw, 12px)",
        textAlign: "left",
      }}>
        {[
          { icon: "⬡", label: "Visual file tree", desc: "Browse the full repo structure at a glance." },
          { icon: "◈", label: "Cited answers", desc: "Every response traces to exact files and lines." },
          { icon: "◎", label: "Instant indexing", desc: "Clone, chunk, and embed in under a minute." },
        ].map((f, i) => (
          <div key={f.label} className="fadeUp feature-card" style={{
            border: "1px solid var(--border)",
            borderRadius: 12,
            padding: "clamp(12px, 2vw, 16px)",
            background: "var(--surface)",
            animationDelay: `${0.1 + i * 0.07}s`,
          }}>
            <div style={{ fontSize: "clamp(16px, 3vw, 20px)", color: "var(--amber)", marginBottom: "clamp(8px, 2vw, 10px)" }}>{f.icon}</div>
            <div style={{ fontSize: "clamp(12px, 2vw, 13px)", fontWeight: 600, marginBottom: 5 }}>{f.label}</div>
            <div style={{ fontSize: "clamp(11px, 2vw, 12px)", color: "var(--text-muted)", lineHeight: 1.55 }}>{f.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function QuickPromptsPanel({ onSelect, repoName }: { onSelect: (q: string) => void; repoName: string }) {
  return (
    <div className="fadeUp" style={{
      width: "100%",
      maxWidth: "clamp(260px, 90vw, 520px)",
    }}>
      <div style={{ textAlign: "center", marginBottom: "clamp(20px, 5vw, 28px)" }}>
        <div className="badge badge-cyan" style={{
          margin: "0 auto clamp(10px, 2vw, 12px)",
          fontSize: "clamp(10px, 2vw, 11px)",
        }}>Index ready</div>
        <h2 style={{
          fontSize: "clamp(18px, 4vw, 20px)",
          fontWeight: 700,
          letterSpacing: "-0.02em",
          marginBottom: "clamp(6px, 1.5vw, 6px)",
          lineHeight: 1.2,
        }}>
          {repoName ? `Exploring ${repoName}` : "Repository indexed"}
        </h2>
        <p style={{
          color: "var(--text-muted)",
          fontSize: "clamp(12px, 2vw, 13px)",
          lineHeight: 1.5,
        }}>Ask anything, or start with one of these:</p>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "clamp(8px, 2vw, 10px)" }}>
        {QUICK_PROMPTS.map((p) => (
          <button key={p} onClick={() => onSelect(p)} style={{
            background: "var(--surface)",
            border: "1.5px solid var(--border)",
            borderRadius: 12,
            padding: "clamp(11px, 2vw, 13px) clamp(14px, 3vw, 18px)",
            fontSize: "clamp(12px, 2vw, 13px)",
            textAlign: "left",
            color: "var(--text)",
            fontFamily: "inherit",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "clamp(10px, 2vw, 12px)",
            transition: "border-color 0.15s, background 0.15s, transform 0.12s",
          }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "var(--amber)";
              e.currentTarget.style.background = "var(--surface-raised)";
              e.currentTarget.style.transform = "translateX(3px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "var(--border)";
              e.currentTarget.style.background = "var(--surface)";
              e.currentTarget.style.transform = "translateX(0)";
            }}
          >
            <span style={{ color: "var(--amber)", fontSize: "clamp(14px, 3vw, 16px)", flexShrink: 0 }}>◈</span>
            <span style={{ flex: 1, minWidth: 0 }}>{p}</span>
            <span style={{ marginLeft: "auto", color: "var(--text-dim)", fontSize: "clamp(12px, 2vw, 14px)", flexShrink: 0 }}>→</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function MessageBubble({ message, onCitationClick }: { message: { role: "user" | "assistant"; content: string; citations?: Citation[] }; onCitationClick: (path: string) => void }) {
  const isUser = message.role === "user";
  return (
    <div className="fadeUp" style={{
      display: "flex",
      flexDirection: "column",
      alignItems: isUser ? "flex-end" : "flex-start",
      gap: "clamp(6px, 1.5vw, 8px)",
      width: "100%",
    }}>
      <div style={{
        fontSize: "clamp(9px, 2vw, 10px)",
        fontWeight: 600,
        textTransform: "uppercase",
        letterSpacing: "0.08em",
        color: "var(--text-dim)",
        padding: "0 clamp(2px, 1vw, 4px)",
      }}>
        {isUser ? "You" : "RepoMind"}
      </div>
      <div style={{
        maxWidth: "100%",
        background: isUser ? "var(--amber)" : "var(--surface-raised)",
        border: isUser ? "none" : "1px solid var(--border)",
        color: isUser ? "#080b12" : "var(--text)",
        padding: "clamp(10px, 2vw, 12px) clamp(12px, 2vw, 16px)",
        borderRadius: isUser ? "16px 16px 4px 16px" : "4px 16px 16px 16px",
        fontSize: "clamp(12px, 2vw, 14px)",
        lineHeight: 1.7,
        whiteSpace: "pre-wrap",
        wordBreak: "break-word",
        boxShadow: isUser ? "0 4px 16px rgba(245,158,11,0.2)" : "var(--shadow-sm)",
        fontWeight: isUser ? 500 : 400,
      }}>
        {message.content}
      </div>
      {message.citations && message.citations.length > 0 && (
        <div style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "clamp(4px, 1.5vw, 6px)",
          maxWidth: "100%",
        }}>
          {message.citations.map((c, j) => (
            <button key={j} className="citation-pill" onClick={() => onCitationClick(c.file_path)} title={`Jump to ${c.file_path}`} style={{
              fontSize: "clamp(10px, 2vw, 11px)",
              padding: "clamp(2px, 1vw, 3px) clamp(7px, 2vw, 9px)",
            }}>
              <span style={{ opacity: 0.6, marginRight: 2 }}>◈</span>
              {c.file_path}:{c.start_line}–{c.end_line}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function ThinkingBubble() {
  return (
    <div className="fadeIn" style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "flex-start",
      gap: "clamp(6px, 1.5vw, 8px)",
    }}>
      <div style={{
        fontSize: "clamp(9px, 2vw, 10px)",
        fontWeight: 600,
        textTransform: "uppercase",
        letterSpacing: "0.08em",
        color: "var(--text-dim)",
      }}>RepoMind</div>
      <div style={{
        background: "var(--surface-raised)",
        border: "1px solid var(--border)",
        padding: "clamp(10px, 2vw, 12px) clamp(14px, 3vw, 18px)",
        borderRadius: "4px 16px 16px 16px",
        display: "flex",
        alignItems: "center",
        gap: 6,
      }}>
        <span className="typing-dot">●</span>
        <span className="typing-dot">●</span>
        <span className="typing-dot">●</span>
      </div>
    </div>
  );
}
