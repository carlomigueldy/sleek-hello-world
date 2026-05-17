"use client";

import { useState, useEffect, useRef } from "react";

interface Message {
  id: number;
  content: string;
  author: string | null;
  created_at: string;
}

interface Props {
  /** Pre-fills the author field (e.g. from the hero name input). */
  authorHint?: string;
  onMessageSent: (msg: Message) => void;
}

const MAX_CONTENT = 280;
const MAX_AUTHOR  = 40;

export default function MessageForm({ authorHint = "", onMessageSent }: Props) {
  const [content, setContent]   = useState("");
  const [author, setAuthor]     = useState(authorHint);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]       = useState("");
  const [success, setSuccess]   = useState(false);
  const [retryIn, setRetryIn]   = useState(0); // seconds remaining on 429 cooldown
  const retryRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Sync author field when the hint changes externally (hero name input)
  useEffect(() => {
    setAuthor(authorHint);
  }, [authorHint]);

  // Countdown ticker for 429 cooldown
  useEffect(() => {
    if (retryIn <= 0) {
      if (retryRef.current) clearInterval(retryRef.current);
      return;
    }
    retryRef.current = setInterval(() => {
      setRetryIn((s) => {
        if (s <= 1) {
          if (retryRef.current) clearInterval(retryRef.current);
          setError("");
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => { if (retryRef.current) clearInterval(retryRef.current); };
  }, [retryIn]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (retryIn > 0) return;
    setError("");
    setSuccess(false);

    const trimmedContent = content.trim();
    if (!trimmedContent) return;

    setSubmitting(true);
    try {
      const body: { content: string; author?: string } = { content: trimmedContent };
      const trimmedAuthor = author.trim();
      if (trimmedAuthor) body.author = trimmedAuthor;

      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        const newMsg = (await res.json()) as Message;
        onMessageSent(newMsg);
        setContent("");
        setSuccess(true);
        setTimeout(() => setSuccess(false), 2800);
      } else {
        const data = (await res.json()) as { detail?: string; error?: string; retryAfterMs?: number };
        if (data.error === "rate_limited" && typeof data.retryAfterMs === "number") {
          const seconds = Math.ceil(data.retryAfterMs / 1000);
          setRetryIn(seconds);
          setError(`Too many messages — try again in ${seconds}s`);
        } else {
          setError(data.detail ?? "Something went wrong. Please try again.");
        }
      }
    } catch {
      setError("Network error. Please check your connection.");
    } finally {
      setSubmitting(false);
    }
  };

  const charOver  = content.length > MAX_CONTENT * 0.85;
  const isCooling = retryIn > 0;

  return (
    <section className="card" style={{ padding: "28px" }} aria-label="Leave a message">
      <h2
        style={{
          fontSize: "14px",
          fontWeight: 600,
          letterSpacing: "0.05em",
          textTransform: "uppercase",
          color: "var(--fg-muted)",
          marginBottom: "18px",
        }}
      >
        Leave a message
      </h2>

      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: "12px" }}
      >
        {/* Primary: content */}
        <textarea
          className="input-field"
          placeholder="Type something…"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={3}
          maxLength={MAX_CONTENT}
          aria-label="Message content"
          style={{
            borderRadius: "10px",
            padding: "12px 14px",
            fontSize: "15px",
            resize: "vertical",
            width: "100%",
            minHeight: "88px",
            lineHeight: 1.6,
          }}
        />

        {/* Secondary: author name */}
        <div style={{ position: "relative" }}>
          <input
            className="input-field"
            type="text"
            placeholder="Your name (optional)"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            maxLength={MAX_AUTHOR}
            aria-label="Your name (optional)"
            style={{
              borderRadius: "10px",
              padding: "8px 14px",
              fontSize: "13px",
              width: "100%",
              opacity: 0.75,
            }}
          />
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "12px",
          }}
        >
          <span
            style={{
              fontSize: "12px",
              color: charOver ? "#f87171" : "var(--fg-faint)",
              fontVariantNumeric: "tabular-nums",
              transition: "color 0.2s",
            }}
          >
            {content.length}/{MAX_CONTENT}
          </span>

          <button
            type="submit"
            className="btn-primary"
            disabled={submitting || isCooling || content.trim().length === 0}
            style={{
              borderRadius: "10px",
              padding: "10px 22px",
              fontSize: "14px",
              fontWeight: 600,
            }}
          >
            {submitting ? "Sending…" : isCooling ? `Wait ${retryIn}s` : "Send"}
          </button>
        </div>

        {error && (
          <p
            className="anim-fade-in"
            role="alert"
            style={{ fontSize: "13px", color: isCooling ? "#fb923c" : "#f87171", margin: 0 }}
          >
            {isCooling ? `Too many messages — try again in ${retryIn}s` : error}
          </p>
        )}

        {success && (
          <p
            className="anim-fade-in"
            role="status"
            style={{ fontSize: "13px", color: "#34d399", margin: 0 }}
          >
            Message sent.
          </p>
        )}
      </form>
    </section>
  );
}
