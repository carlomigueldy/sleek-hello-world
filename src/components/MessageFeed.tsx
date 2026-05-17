"use client";

import { useState, useEffect, useCallback } from "react";

export interface Message {
  id: number;
  content: string;
  author: string | null;
  created_at: string;
}

interface ApiResponse {
  messages: Message[];
  nextBefore: number | null;
}

interface Props {
  newMessage?: Message | null;
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return new Date(iso).toLocaleDateString();
}

export default function MessageFeed({ newMessage }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [freshIds, setFreshIds] = useState<Set<number>>(new Set());

  const fetchMessages = useCallback(async () => {
    try {
      const res = await fetch("/api/messages?limit=50", { cache: "no-store" });
      if (res.ok) {
        const data = (await res.json()) as ApiResponse;
        setMessages(data.messages);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  useEffect(() => {
    if (!newMessage) return;
    setMessages((prev) => {
      if (prev.some((m) => m.id === newMessage.id)) return prev;
      return [newMessage, ...prev].slice(0, 50);
    });
    setFreshIds((prev) => new Set([...prev, newMessage.id]));
    const timer = setTimeout(() => {
      setFreshIds((prev) => {
        const next = new Set(prev);
        next.delete(newMessage.id);
        return next;
      });
    }, 800);
    return () => clearTimeout(timer);
  }, [newMessage]);

  if (loading) {
    return (
      <section aria-label="Recent messages" aria-busy="true">
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              style={{
                height: 64,
                borderRadius: 12,
                background: "var(--surface)",
                border: "1px solid var(--border)",
                opacity: 0.5 - i * 0.12,
              }}
            />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section aria-label="Recent messages">
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          gap: "8px",
          marginBottom: "14px",
        }}
      >
        <h2
          style={{
            fontSize: "14px",
            fontWeight: 600,
            letterSpacing: "0.05em",
            textTransform: "uppercase",
            color: "var(--fg-muted)",
          }}
        >
          Recent messages
        </h2>
        {messages.length > 0 && (
          <span
            style={{
              fontSize: "11px",
              color: "var(--fg-faint)",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {messages.length}
          </span>
        )}
      </div>

      {messages.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "44px 24px",
            borderRadius: "12px",
            border: "1px dashed var(--border)",
            color: "var(--fg-faint)",
            fontSize: "14px",
            lineHeight: 1.6,
          }}
        >
          Be the first to say hello.
        </div>
      ) : (
        <ul
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            listStyle: "none",
            padding: 0,
            margin: 0,
          }}
        >
          {messages.map((msg) => (
            <li
              key={msg.id}
              className={`message-item ${freshIds.has(msg.id) ? "anim-slide-left" : ""}`}
            >
              <span
                style={{
                  display: "inline-block",
                  fontSize: "11px",
                  fontWeight: msg.author ? 600 : 400,
                  color: msg.author ? "var(--accent-bright)" : "var(--fg-faint)",
                  marginBottom: "4px",
                  letterSpacing: "0.02em",
                  fontStyle: msg.author ? "normal" : "italic",
                }}
              >
                {msg.author ?? "anonymous"}
              </span>
              <p
                style={{
                  margin: 0,
                  fontSize: "14px",
                  lineHeight: 1.65,
                  wordBreak: "break-word",
                  color: "var(--fg)",
                }}
              >
                {msg.content}
              </p>
              <span
                style={{
                  display: "block",
                  marginTop: "6px",
                  fontSize: "11px",
                  color: "var(--fg-faint)",
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {relativeTime(msg.created_at)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
