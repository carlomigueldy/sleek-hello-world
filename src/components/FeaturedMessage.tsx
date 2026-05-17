"use client";

import { useState, useEffect } from "react";

interface FeaturedMsg {
  id: number;
  content: string;
  author: string | null;
}

export default function FeaturedMessage() {
  const [message, setMessage] = useState<FeaturedMsg | null>(null);
  const [visible, setVisible] = useState(true);

  const fetchRandom = async () => {
    try {
      const res = await fetch("/api/messages/random", { cache: "no-store" });
      if (res.status === 204) {
        setMessage(null);
        return;
      }
      if (res.ok) {
        const data = (await res.json()) as FeaturedMsg;
        setVisible(false);
        setTimeout(() => {
          setMessage(data);
          setVisible(true);
        }, 300);
      }
    } catch {
      // silent
    }
  };

  useEffect(() => {
    fetchRandom();
    const interval = setInterval(fetchRandom, 8000);
    return () => clearInterval(interval);
  }, []);

  if (!message) return null;

  return (
    <section
      className="card anim-fade-in-up delay-600"
      style={{
        padding: "20px 24px",
        opacity: visible ? 1 : 0,
        transition: "opacity 0.3s ease",
      }}
      aria-label="Featured message"
    >
      <span
        style={{
          fontSize: "11px",
          fontWeight: 600,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "var(--accent-bright)",
        }}
      >
        Featured message
      </span>
      <p
        style={{
          margin: "10px 0 6px",
          fontSize: "15px",
          lineHeight: 1.65,
          color: "var(--fg)",
          fontStyle: "italic",
        }}
      >
        &ldquo;{message.content}&rdquo;
      </p>
      <span style={{ fontSize: "11px", color: "var(--fg-faint)" }}>
        — {message.author ?? "anonymous"}
      </span>
    </section>
  );
}
