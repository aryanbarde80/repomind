"use client";

import { useEffect, useRef, useState } from "react";

type TreeNode = { name: string; path: string; type: "file" | "dir"; children?: TreeNode[] };
export type TraceTarget = { path: string; key: number } | null;

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function fileIcon(name: string): string {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  const map: Record<string, string> = {
    ts: "󰛦", tsx: "󰜈", js: "󰌞", jsx: "󰜈",
    py: "󰌠", go: "󰟓", rs: "󱘗", rb: "󰴭",
    md: "󰍔", json: "󰘦", yaml: "󰈙", yml: "󰈙",
    css: "󰌜", html: "󰌝", sh: "", dockerfile: "󰡨",
    env: "", txt: "", gitignore: "",
  };
  // Fallback to emoji for plain text rendering
  const emojiMap: Record<string, string> = {
    ts: "◈", tsx: "◈", js: "◇", jsx: "◇",
    py: "▸", go: "▹", rs: "▸", rb: "▸",
    md: "◻", json: "{ }", yaml: "≡", yml: "≡",
    css: "◁", html: "◁", sh: "$", dockerfile: "⬡",
  };
  return emojiMap[ext] || "·";
}

function dirIcon(open: boolean): string {
  return open ? "▾" : "▸";
}

export default function FileTree({
  repoId,
  onFileClick,
  traceTarget,
}: {
  repoId: string;
  onFileClick: (path: string) => void;
  traceTarget?: TraceTarget;
}) {
  const [tree, setTree] = useState<TreeNode | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`${API_URL}/repo/files/${repoId}`)
      .then((res) => res.json())
      .then((data) => setTree(data))
      .finally(() => setLoading(false));
  }, [repoId]);

  if (loading) {
    return (
      <div className="fadeIn" style={{
        padding: "clamp(14px, 3vw, 20px) clamp(12px, 2vw, 16px)",
        display: "flex",
        flexDirection: "column",
        gap: "clamp(6px, 1.5vw, 8px)",
      }}>
        {[0.9, 0.7, 1, 0.6, 0.8].map((w, i) => (
          <div key={i} style={{
            height: "clamp(10px, 2vw, 12px)",
            borderRadius: 6,
            width: `${w * 100}%`,
            background: "linear-gradient(90deg, var(--surface-raised) 0%, var(--surface-high) 50%, var(--surface-raised) 100%)",
            backgroundSize: "200% 100%",
            animationDelay: `${i * 0.1}s`,
          }} />
        ))}
      </div>
    );
  }
  if (!tree) return null;

  return (
    <div className="fadeIn" style={{
      fontSize: "clamp(10px, 2vw, 12px)",
      overflowY: "auto",
      flex: 1,
      paddingBottom: "clamp(8px, 2vw, 12px)",
    }}>
      {tree.children?.map((child) => (
        <TreeRow key={child.path} node={child} depth={0} onFileClick={onFileClick} traceTarget={traceTarget} />
      ))}
    </div>
  );
}

function TreeRow({
  node,
  depth,
  onFileClick,
  traceTarget,
}: {
  node: TreeNode;
  depth: number;
  onFileClick: (path: string) => void;
  traceTarget?: TraceTarget;
}) {
  const isAncestorOfTrace = !!traceTarget && traceTarget.path.startsWith(node.path + "/");
  const [open, setOpen] = useState(depth === 0);
  const rowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isAncestorOfTrace) setOpen(true);
  }, [isAncestorOfTrace, traceTarget?.key]);

  const isLit = node.type === "file" && traceTarget?.path === node.path;

  useEffect(() => {
    if (isLit) rowRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [isLit, traceTarget?.key]);

  if (node.type === "dir") {
    return (
      <div>
        <div
          onClick={() => setOpen(!open)}
          className="tree-row"
          style={{
            padding: "clamp(4px, 1vw, 5px) clamp(8px, 2vw, 10px)",
            paddingLeft: `clamp(8px, 2vw, 10px)`,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "clamp(5px, 1.5vw, 7px)",
            color: "var(--text-muted)",
            userSelect: "none",
          }}
        >
          <span style={{
            fontSize: "clamp(8px, 2vw, 9px)",
            color: "var(--text-dim)",
            transition: "transform 0.18s ease",
            transform: open ? "rotate(90deg)" : "rotate(0deg)",
            display: "inline-block",
            fontFamily: "var(--font-mono)",
            flexShrink: 0,
          }}>▶</span>
          <span style={{
            fontSize: "clamp(10px, 2vw, 11px)",
            color: open ? "var(--amber)" : "var(--text-dim)",
            marginRight: 2,
            flexShrink: 0,
          }}>
            {open ? "▼" : "▶"}
          </span>
          <span style={{
            fontWeight: 500,
            color: "var(--text-muted)",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            minWidth: 0,
          }}>{node.name}</span>
        </div>
        {open && node.children?.map((child) => (
          <TreeRow key={child.path} node={child} depth={depth + 1} onFileClick={onFileClick} traceTarget={traceTarget} />
        ))}
      </div>
    );
  }

  const icon = fileIcon(node.name);

  return (
    <div
      key={isLit ? `lit-${traceTarget?.key}` : node.path}
      ref={rowRef}
      onClick={() => onFileClick(node.path)}
      className={`tree-row ${isLit ? "trace-pulse" : ""}`}
      style={{
        padding: "clamp(4px, 1vw, 5px) clamp(8px, 2vw, 10px)",
        paddingLeft: `clamp(20px, 5vw, ${24 + depth * 16}px)`,
        cursor: "pointer",
        fontFamily: "var(--font-mono)",
        fontSize: "clamp(10px, 2vw, 11.5px)",
        display: "flex",
        alignItems: "center",
        gap: "clamp(5px, 1.5vw, 7px)",
        color: isLit ? "var(--amber)" : "var(--text)",
        minWidth: 0,
      }}
    >
      <span style={{
        color: isLit ? "var(--amber)" : "var(--cyan)",
        fontSize: "clamp(9px, 2vw, 10px)",
        flexShrink: 0,
      }}>{icon}</span>
      <span style={{
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
        minWidth: 0,
      }}>{node.name}</span>
    </div>
  );
}
