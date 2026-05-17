"use client";

import { useState, useEffect, useCallback } from "react";

type State = "idle" | "loading" | "ok" | "error";

export default function ServerPing() {
  const [state, setState] = useState<State>("idle");
  const [ms, setMs] = useState<number | null>(null);

  const ping = useCallback(async () => {
    setState("loading");
    setMs(null);
    const start = performance.now();
    try {
      const res = await fetch("/api/hello", { cache: "no-store" });
      const elapsed = Math.round(performance.now() - start);
      if (res.ok) {
        setMs(elapsed);
        setState("ok");
      } else {
        setState("error");
      }
    } catch {
      setState("error");
    }
  }, []);

  useEffect(() => {
    ping();
  }, [ping]);

  const dotColor =
    state === "ok"
      ? "#34d399"
      : state === "error"
        ? "#f87171"
        : state === "loading"
          ? "var(--accent-bright)"
          : "var(--fg-faint)";

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        fontSize: "12px",
        color: "var(--fg-muted)",
        padding: "4px 10px",
        borderRadius: "999px",
        border: "1px solid var(--border)",
        background: "var(--surface)",
      }}
      title="API round-trip latency"
    >
      {/* Dot with ping ring when loading */}
      <span className="ping-dot-wrap" style={{ width: 8, height: 8 }}>
        {state === "loading" && <span className="ping-ring" />}
        <span
          style={{
            display: "block",
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: dotColor,
            transition: "background 0.3s",
            position: "relative",
            zIndex: 1,
          }}
        />
      </span>

      <span style={{ fontVariantNumeric: "tabular-nums" }}>
        {state === "loading" && "pinging…"}
        {state === "ok" && ms !== null && `${ms} ms`}
        {state === "error" && "unreachable"}
        {state === "idle" && "—"}
      </span>

      {(state === "ok" || state === "error") && (
        <button
          onClick={ping}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "var(--fg-faint)",
            fontSize: "11px",
            padding: "0 0 0 2px",
            lineHeight: 1,
            transition: "color 0.15s",
          }}
          onMouseEnter={(e) =>
            ((e.currentTarget as HTMLButtonElement).style.color =
              "var(--accent-bright)")
          }
          onMouseLeave={(e) =>
            ((e.currentTarget as HTMLButtonElement).style.color =
              "var(--fg-faint)")
          }
          aria-label="Retry ping"
          title="Retry"
        >
          ↺
        </button>
      )}
    </div>
  );
}
