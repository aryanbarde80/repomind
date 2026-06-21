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
      <div className="fadeIn" style={{ padding: "20px 16px", display: "flex", flexDirection: "column", gap: 8 }}>
        {[0.9, 0.7, 1, 0.6, 0.8].map((w, i) => (
          <div key={i} style={{
            height: 12, borderRadius: 6, width: `${w * 100}%`,
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
    <div className="fadeIn" style={{ fontSize: 12, overflowY: "auto", flex: 1, paddingBottom: 12 }}>
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
            padding: "5px 10px",
            paddingLeft: 10 + depth * 16,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 7,
            color: "var(--text-muted)",
            userSelect: "none",
          }}
        >
          <span style={{
            fontSize: 9,
            color: "var(--text-dim)",
            transition: "transform 0.18s ease",
            transform: open ? "rotate(90deg)" : "rotate(0deg)",
            display: "inline-block",
            fontFamily: "var(--font-mono)",
          }}>▶</span>
          <span style={{ fontSize: 11, color: open ? "var(--amber)" : "var(--text-dim)", marginRight: 2 }}>
            {open ? "▼" : "▶"}
          </span>
          <span style={{ fontWeight: 500, color: "var(--text-muted)" }}>{node.name}</span>
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
        padding: "5px 10px",
        paddingLeft: 24 + depth * 16,
        cursor: "pointer",
        fontFamily: "var(--font-mono)",
        fontSize: 11.5,
        display: "flex",
        alignItems: "center",
        gap: 7,
        color: isLit ? "var(--amber)" : "var(--text)",
      }}
    >
      <span style={{ color: isLit ? "var(--amber)" : "var(--cyan)", fontSize: 10, flexShrink: 0 }}>{icon}</span>
      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{node.name}</span>
    </div>
  );
}
