"use client";

import { useClerk } from "@clerk/nextjs";

export default function LandingPage() {
  const { openSignIn } = useClerk();

  return (
    <div style={{ overflowX: "hidden" }}>
      {/* ── Hero Section ── */}
      <section style={{
        minHeight: "calc(100vh - 52px)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "clamp(40px, 8vw, 80px) clamp(16px, 5vw, 24px)",
        position: "relative",
        textAlign: "center",
      }}>
        {/* Animated gradient background */}
        <div style={{
          position: "absolute",
          inset: 0,
          zIndex: 0,
          background: `
            radial-gradient(ellipse 900px 600px at 50% 0%, rgba(245,158,11,0.08) 0%, transparent 60%),
            radial-gradient(ellipse 600px 400px at 100% 50%, rgba(34,211,238,0.05) 0%, transparent 60%),
            radial-gradient(ellipse 500px 400px at 0% 100%, rgba(129,140,248,0.04) 0%, transparent 60%)
          `,
          pointerEvents: "none",
        }} />

        {/* Grid pattern overlay */}
        <div style={{
          position: "absolute",
          inset: 0,
          zIndex: 0,
          backgroundImage: `
            linear-gradient(rgba(245,158,11,0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(245,158,11,0.02) 1px, transparent 1px)
          `,
          backgroundSize: "clamp(32px, 5vw, 48px) clamp(32px, 5vw, 48px)",
          maskImage: "radial-gradient(ellipse 100% 80% at 50% 50%, black, transparent)",
          WebkitMaskImage: "radial-gradient(ellipse 100% 80% at 50% 50%, black, transparent)",
          pointerEvents: "none",
        }} />

        <div style={{ position: "relative", zIndex: 1, maxWidth: "100%", width: "100%" }}>
          {/* Badge */}
          <div className="fadeUp" style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "clamp(6px, 2vw, 8px)",
            background: "rgba(245,158,11,0.08)",
            border: "1px solid rgba(245,158,11,0.2)",
            borderRadius: 100,
            padding: "clamp(6px, 1.5vw, 8px) clamp(12px, 3vw, 16px)",
            marginBottom: "clamp(20px, 5vw, 32px)",
            fontSize: "clamp(10px, 2vw, 12px)",
          }}>
            <span style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "var(--amber)",
              animation: "pulseDot 2s ease-in-out infinite",
              display: "inline-block",
              flexShrink: 0,
            }} />
            <span style={{
              fontWeight: 600,
              color: "var(--amber)",
              letterSpacing: "0.05em",
              whiteSpace: "nowrap",
            }}>
              AI-powered code understanding
            </span>
          </div>

          {/* Main headline */}
          <h1 className="fadeUp" style={{
            fontSize: "clamp(28px, 8vw, 68px)",
            fontWeight: 800,
            lineHeight: 1.1,
            letterSpacing: "-0.04em",
            marginBottom: "clamp(16px, 4vw, 24px)",
            animationDelay: "0.05s",
            maxWidth: "100%",
          }}>
            Understand any codebase
            <br style={{ display: "none" }} />
            <span style={{ display: "block", marginTop: "clamp(8px, 2vw, 12px)" }}>
              <span className="gold-shimmer">in minutes.</span>
            </span>
          </h1>

          {/* Subheading */}
          <p className="fadeUp" style={{
            fontSize: "clamp(14px, 3vw, 18px)",
            color: "var(--text-muted)",
            lineHeight: 1.75,
            maxWidth: "clamp(280px, 90vw, 600px)",
            margin: "0 auto clamp(28px, 6vw, 48px)",
            animationDelay: "0.1s",
          }}>
            Paste a GitHub URL. RepoMind reads every file, builds a semantic index, and answers your questions with <strong style={{ color: "var(--text)", fontWeight: 600 }}>exact file and line citations</strong> — like a senior dev who knows the whole repo.
          </p>

          {/* CTA buttons */}
          <div className="fadeUp" style={{
            display: "flex",
            gap: "clamp(10px, 3vw, 14px)",
            justifyContent: "center",
            flexWrap: "wrap",
            animationDelay: "0.15s",
            marginBottom: "clamp(28px, 6vw, 52px)",
          }}>
            <button
              className="btn btn-primary"
              style={{
                padding: "clamp(12px, 2.5vw, 14px) clamp(24px, 5vw, 32px)",
                fontSize: "clamp(13px, 2vw, 15px)",
                borderRadius: 12,
                fontWeight: 600,
              }}
              onClick={() => openSignIn()}
            >
              Get started free →
            </button>
            <a
              href="https://github.com/aryanbarde80/repomind"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "clamp(6px, 2vw, 8px)",
                padding: "clamp(12px, 2.5vw, 14px) clamp(20px, 4vw, 28px)",
                fontSize: "clamp(13px, 2vw, 15px)",
                borderRadius: 12,
                background: "transparent",
                border: "1.5px solid var(--border)",
                color: "var(--text-muted)",
                textDecoration: "none",
                fontWeight: 600,
                transition: "border-color 0.15s, color 0.15s",
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
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
              </svg>
              <span style={{ display: "none" }}></span>
              View on GitHub
            </a>
          </div>

          {/* Social proof */}
          <div className="fadeUp" style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "clamp(6px, 2vw, 8px)",
            color: "var(--text-dim)",
            fontSize: "clamp(11px, 2vw, 12px)",
            flexWrap: "wrap",
            animationDelay: "0.2s",
          }}>
            <span style={{ width: 4, height: 4, borderRadius: "50%", background: "var(--success)", display: "inline-block", flexShrink: 0 }} />
            <span>Free to use · Open source · No credit card required</span>
          </div>
        </div>
      </section>

      {/* ── Features Section ── */}
      <section style={{
        padding: "clamp(48px, 10vw, 80px) clamp(16px, 5vw, 24px)",
        maxWidth: 1200,
        margin: "0 auto",
        width: "100%",
      }}>
        <div className="fadeUp" style={{
          textAlign: "center",
          marginBottom: "clamp(36px, 8vw, 56px)",
        }}>
          <div className="badge badge-amber" style={{
            margin: "0 auto clamp(12px, 3vw, 16px)",
            fontSize: "clamp(10px, 2vw, 11px)",
          }}>
            How it works
          </div>
          <h2 style={{
            fontSize: "clamp(22px, 6vw, 42px)",
            fontWeight: 700,
            letterSpacing: "-0.03em",
            marginBottom: "clamp(12px, 3vw, 14px)",
            lineHeight: 1.2,
          }}>
            From URL to insight in seconds
          </h2>
          <p style={{
            color: "var(--text-muted)",
            fontSize: "clamp(13px, 2.5vw, 15px)",
            maxWidth: "clamp(260px, 90vw, 480px)",
            margin: "0 auto",
            lineHeight: 1.6,
          }}>
            Three steps. No setup. No config files. Just paste and ask.
          </p>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(clamp(260px, 90vw, 320px), 1fr))",
          gap: "clamp(16px, 4vw, 24px)",
          width: "100%",
        }}>
          {[
            {
              step: "01",
              icon: "⬡",
              title: "Paste a GitHub URL",
              desc: "Any public repository. RepoMind clones it, reads every file, and chunks the code into semantic segments optimized for retrieval.",
              color: "var(--amber)",
            },
            {
              step: "02",
              icon: "◈",
              title: "Ask in plain English",
              desc: "No query syntax. Ask anything — architecture questions, bug hunting, onboarding questions, security reviews — just like talking to a teammate.",
              color: "var(--cyan)",
            },
            {
              step: "03",
              icon: "◎",
              title: "Get cited answers",
              desc: "Every response traces back to exact files and line numbers. Click any citation to jump straight to the source. Verify everything.",
              color: "var(--violet)",
            },
          ].map((f, i) => (
            <div
              key={f.step}
              className="fadeUp feature-card card"
              style={{
                padding: "clamp(24px, 5vw, 32px) clamp(20px, 4vw, 28px)",
                animationDelay: `${i * 0.08}s`,
                position: "relative",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
              }}
            >
              {/* Step number watermark */}
              <div style={{
                position: "absolute",
                top: "clamp(12px, 3vw, 16px)",
                right: "clamp(16px, 3vw, 20px)",
                fontSize: "clamp(36px, 8vw, 48px)",
                fontWeight: 800,
                color: "var(--surface-high)",
                fontFamily: "var(--font-mono)",
                lineHeight: 1,
                userSelect: "none",
              }}>
                {f.step}
              </div>

              <div style={{
                width: "clamp(40px, 8vw, 48px)",
                height: "clamp(40px, 8vw, 48px)",
                borderRadius: 14,
                background: `${f.color}15`,
                border: `1px solid ${f.color}30`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "clamp(18px, 4vw, 22px)",
                color: f.color,
                marginBottom: "clamp(16px, 3vw, 20px)",
                flexShrink: 0,
              }}>
                {f.icon}
              </div>

              <h3 style={{
                fontSize: "clamp(15px, 3vw, 17px)",
                fontWeight: 700,
                marginBottom: "clamp(8px, 2vw, 10px)",
                letterSpacing: "-0.01em",
                lineHeight: 1.3,
              }}>
                {f.title}
              </h3>

              <p style={{
                fontSize: "clamp(12px, 2.5vw, 13.5px)",
                color: "var(--text-muted)",
                lineHeight: 1.7,
                margin: 0,
                flex: 1,
              }}>
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Feature Highlights Grid ── */}
      <section style={{
        padding: "clamp(48px, 10vw, 80px) clamp(16px, 5vw, 24px)",
        maxWidth: 1200,
        margin: "0 auto",
        width: "100%",
      }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(clamp(240px, 90vw, 280px), 1fr))",
          gap: "clamp(12px, 3vw, 16px)",
          width: "100%",
        }}>
          {[
            { icon: "⚡", label: "30s indexing", desc: "Fast clone, chunk, embed pipeline" },
            { icon: "◈", label: "Line-level citations", desc: "Trace every answer to its source" },
            { icon: "⬡", label: "Visual file tree", desc: "Browse the full repo structure" },
            { icon: "◎", label: "Any public repo", desc: "Works with GitHub URLs instantly" },
            { icon: "✦", label: "Semantic search", desc: "Vector-powered deep retrieval" },
            { icon: "⬟", label: "Open source", desc: "MIT licensed, self-hostable" },
          ].map((item, i) => (
            <div
              key={item.label}
              className="fadeUp card"
              style={{
                padding: "clamp(16px, 3vw, 20px)",
                display: "flex",
                alignItems: "flex-start",
                gap: "clamp(12px, 2vw, 14px)",
                animationDelay: `${i * 0.05}s`,
                transition: "border-color 0.2s, transform 0.2s",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLDivElement).style.borderColor = "var(--amber)";
                (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLDivElement).style.borderColor = "var(--border)";
                (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
              }}
            >
              <span style={{
                fontSize: "clamp(18px, 4vw, 20px)",
                color: "var(--amber)",
                flexShrink: 0,
                marginTop: 1,
              }}>
                {item.icon}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: "clamp(12px, 2.5vw, 13px)",
                  fontWeight: 600,
                  marginBottom: "clamp(2px, 1vw, 3px)",
                  wordBreak: "break-word",
                }}>
                  {item.label}
                </div>
                <div style={{
                  fontSize: "clamp(11px, 2vw, 12px)",
                  color: "var(--text-muted)",
                  lineHeight: 1.5,
                }}>
                  {item.desc}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section style={{
        padding: "0 clamp(16px, 5vw, 24px) clamp(60px, 10vw, 100px)",
        maxWidth: 900,
        margin: "0 auto",
        width: "100%",
      }}>
        <div className="fadeUp" style={{
          background: "linear-gradient(135deg, rgba(245,158,11,0.08) 0%, rgba(34,211,238,0.04) 100%)",
          border: "1px solid rgba(245,158,11,0.2)",
          borderRadius: "clamp(16px, 4vw, 24px)",
          padding: "clamp(32px, 6vw, 56px) clamp(24px, 5vw, 48px)",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }}>
          <div style={{
            position: "absolute",
            top: "-30%",
            left: "50%",
            transform: "translateX(-50%)",
            width: "clamp(300px, 80vw, 400px)",
            height: 200,
            background: "radial-gradient(ellipse, rgba(245,158,11,0.1) 0%, transparent 70%)",
            pointerEvents: "none",
          }} />

          <h2 style={{
            fontSize: "clamp(20px, 5vw, 36px)",
            fontWeight: 700,
            marginBottom: "clamp(12px, 3vw, 14px)",
            letterSpacing: "-0.02em",
            lineHeight: 1.2,
            position: "relative",
            zIndex: 1,
          }}>
            Ready to explore a codebase?
          </h2>

          <p style={{
            color: "var(--text-muted)",
            fontSize: "clamp(13px, 2.5vw, 15px)",
            marginBottom: "clamp(24px, 5vw, 36px)",
            lineHeight: 1.6,
            maxWidth: "clamp(260px, 90vw, 500px)",
            margin: "0 auto clamp(24px, 5vw, 36px)",
            position: "relative",
            zIndex: 1,
          }}>
            Sign in and paste any GitHub URL to get started. Free, no credit card needed.
          </p>

          <button
            className="btn btn-primary"
            style={{
              padding: "clamp(12px, 2.5vw, 14px) clamp(28px, 5vw, 36px)",
              fontSize: "clamp(13px, 2vw, 15px)",
              borderRadius: 12,
              position: "relative",
              zIndex: 1,
            }}
            onClick={() => openSignIn()}
          >
            Start exploring →
          </button>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{
        borderTop: "1px solid var(--border)",
        padding: "clamp(36px, 6vw, 48px) clamp(16px, 5vw, 24px) clamp(28px, 5vw, 36px)",
        maxWidth: 1200,
        margin: "0 auto",
        width: "100%",
      }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr",
          gap: "clamp(32px, 6vw, 48px)",
          marginBottom: "clamp(32px, 6vw, 40px)",
        }}>
          {/* Brand */}
          <div>
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "clamp(8px, 2vw, 10px)",
              marginBottom: "clamp(10px, 2vw, 12px)",
              flexWrap: "wrap",
            }}>
              <div style={{
                width: 28,
                height: 28,
                borderRadius: 8,
                background: "var(--amber-soft)",
                border: "1px solid rgba(245,158,11,0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--amber)",
                fontSize: 14,
                flexShrink: 0,
              }}>
                ⬡
              </div>
              <span className="gold-shimmer" style={{
                fontSize: "clamp(13px, 3vw, 15px)",
                fontWeight: 700,
                letterSpacing: "-0.02em",
              }}>
                RepoMind
              </span>
            </div>
            <p style={{
              fontSize: "clamp(12px, 2vw, 13px)",
              color: "var(--text-dim)",
              lineHeight: 1.65,
              maxWidth: 320,
              margin: 0,
            }}>
              AI-powered codebase assistant. Understand any GitHub repository through natural language questions with cited answers.
            </p>
          </div>

          {/* Links */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
            gap: "clamp(24px, 5vw, 40px)",
          }}>
            <div>
              <div style={{
                fontSize: "clamp(10px, 2vw, 11px)",
                fontWeight: 600,
                color: "var(--text-dim)",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                marginBottom: "clamp(10px, 2vw, 14px)",
              }}>
                Project
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "clamp(8px, 2vw, 10px)" }}>
                {[
                  { label: "GitHub", href: "https://github.com/aryanbarde80/repomind" },
                  { label: "Original Repo", href: "https://github.com/Anas2604-web/repomind" },
                ].map((l) => (
                  <a
                    key={l.label}
                    href={l.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      fontSize: "clamp(12px, 2vw, 13px)",
                      color: "var(--text-muted)",
                      textDecoration: "none",
                      transition: "color 0.15s",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text)")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
                  >
                    {l.label}
                  </a>
                ))}
              </div>
            </div>

            <div>
              <div style={{
                fontSize: "clamp(10px, 2vw, 11px)",
                fontWeight: 600,
                color: "var(--text-dim)",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                marginBottom: "clamp(10px, 2vw, 14px)",
              }}>
                Developers
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "clamp(8px, 2vw, 10px)" }}>
                {[
                  { label: "Anas Khan", href: "https://github.com/Anas2604-web" },
                  { label: "Aryan Barde", href: "https://github.com/aryanbarde80" },
                ].map((l) => (
                  <a
                    key={l.label}
                    href={l.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      fontSize: "clamp(12px, 2vw, 13px)",
                      color: "var(--text-muted)",
                      textDecoration: "none",
                      transition: "color 0.15s",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text)")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text)")}
                  >
                    {l.label}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Developer Cards */}
        <div style={{ marginBottom: "clamp(28px, 5vw, 36px)" }}>
          <div style={{
            fontSize: "clamp(10px, 2vw, 11px)",
            fontWeight: 600,
            color: "var(--text-dim)",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            marginBottom: "clamp(14px, 3vw, 20px)",
          }}>
            Built by
          </div>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(clamp(240px, 90vw, 280px), 1fr))",
            gap: "clamp(12px, 3vw, 16px)",
          }}>
            {[
              {
                name: "Anas Khan",
                role: "Original Creator",
                github: "https://github.com/Anas2604-web",
                linkedin: "https://www.linkedin.com/in/anas2604/",
                initials: "AK",
                color: "var(--cyan)",
              },
              {
                name: "Aryan Barde",
                role: "UI & Frontend",
                github: "https://github.com/aryanbarde80",
                linkedin: "https://www.linkedin.com/in/aryanbarde80/",
                initials: "AB",
                color: "var(--amber)",
              },
            ].map((dev) => (
              <div
                key={dev.name}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "clamp(12px, 3vw, 14px)",
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  borderRadius: 14,
                  padding: "clamp(14px, 3vw, 16px) clamp(16px, 3vw, 20px)",
                  transition: "border-color 0.2s, transform 0.2s",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLDivElement).style.borderColor = dev.color;
                  (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.borderColor = "var(--border)";
                  (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
                }}
              >
                {/* Avatar */}
                <div style={{
                  width: "clamp(40px, 8vw, 44px)",
                  height: "clamp(40px, 8vw, 44px)",
                  borderRadius: 12,
                  flexShrink: 0,
                  background: `${dev.color}15`,
                  border: `1.5px solid ${dev.color}40`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "clamp(11px, 2vw, 13px)",
                  fontWeight: 700,
                  color: dev.color,
                  fontFamily: "var(--font-mono)",
                }}>
                  {dev.initials}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: "clamp(13px, 2.5vw, 14px)",
                    fontWeight: 600,
                    marginBottom: 2,
                    wordBreak: "break-word",
                  }}>
                    {dev.name}
                  </div>
                  <div style={{
                    fontSize: "clamp(10px, 2vw, 11px)",
                    color: "var(--text-dim)",
                    marginBottom: "clamp(8px, 2vw, 10px)",
                  }}>
                    {dev.role}
                  </div>
                  <div style={{
                    display: "flex",
                    gap: "clamp(8px, 2vw, 10px)",
                    flexWrap: "wrap",
                  }}>
                    <a
                      href={dev.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                        fontSize: "clamp(10px, 2vw, 11px)",
                        color: "var(--text-muted)",
                        textDecoration: "none",
                        fontWeight: 500,
                        transition: "color 0.15s",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text)")}
                      onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
                      </svg>
                      GitHub
                    </a>
                    <a
                      href={dev.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                        fontSize: "clamp(10px, 2vw, 11px)",
                        color: "var(--text-muted)",
                        textDecoration: "none",
                        fontWeight: 500,
                        transition: "color 0.15s",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = dev.color)}
                      onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                      </svg>
                      LinkedIn
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          paddingTop: "clamp(20px, 4vw, 24px)",
          borderTop: "1px solid var(--border)",
          flexWrap: "wrap",
          gap: "clamp(8px, 2vw, 12px)",
          textAlign: "center",
        }}>
          <span style={{
            fontSize: "clamp(11px, 2vw, 12px)",
            color: "var(--text-dim)",
          }}>
            © 2025 RepoMind. Open source under MIT License.
          </span>
          <span style={{
            fontSize: "clamp(11px, 2vw, 12px)",
            color: "var(--text-dim)",
          }}>
            Built with ⬡ Next.js · FastAPI · Qdrant
          </span>
        </div>
      </footer>
    </div>
  );
}
