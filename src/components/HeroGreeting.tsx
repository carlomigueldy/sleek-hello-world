"use client";

import { useState, useEffect, useRef } from "react";

interface Greeting {
  message: string;
  timestamp: string;
}

const NAME_RE = /^[a-zA-Z0-9 '\-_.]{0,64}$/;

interface Props {
  name: string;
  onNameChange: (name: string) => void;
}

export default function HeroGreeting({ name, onNameChange }: Props) {
  const [greeting, setGreeting] = useState<Greeting | null>(null);
  const [loading, setLoading] = useState(true);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchGreeting = async (n: string) => {
    setLoading(true);
    try {
      const url = n.trim()
        ? `/api/hello?name=${encodeURIComponent(n.trim())}`
        : "/api/hello";
      const res = await fetch(url);
      if (res.ok) {
        const data = (await res.json()) as Greeting;
        setGreeting(data);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGreeting("");
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (NAME_RE.test(name)) fetchGreeting(name);
    }, 350);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [name]);

  return (
    <section
      className="relative flex min-h-screen flex-col items-center justify-center px-4 text-center overflow-hidden"
      aria-label="Hero greeting"
    >
      {/* Aurora background */}
      <div className="aurora-wrap" aria-hidden>
        <div className="aurora" />
      </div>

      {/* Radial vignette overlay */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse 80% 60% at 50% 50%, transparent 30%, var(--bg) 100%)",
          zIndex: 1,
          pointerEvents: "none",
        }}
      />

      <div
        className="relative flex flex-col items-center gap-8"
        style={{ zIndex: 2 }}
      >
        {/* Live badge */}
        <div
          className="anim-fade-in-up delay-100"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            padding: "5px 14px",
            borderRadius: "999px",
            border: "1px solid rgba(124,58,237,0.35)",
            background: "rgba(124,58,237,0.08)",
            fontSize: "11px",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "var(--accent-bright)",
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "#34d399",
              display: "inline-block",
              boxShadow: "0 0 6px #34d399",
            }}
          />
          Live
        </div>

        {/* Main heading */}
        <h1
          className="shimmer-text text-glow anim-fade-in-up delay-200"
          style={{
            fontSize: "clamp(3rem, 10vw, 6.5rem)",
            fontWeight: 800,
            lineHeight: 1.0,
            letterSpacing: "-0.04em",
          }}
        >
          Hello, World.
        </h1>

        {/* Tagline */}
        <p
          className="anim-fade-in-up delay-300"
          style={{
            color: "var(--fg-muted)",
            fontSize: "clamp(1rem, 2.5vw, 1.15rem)",
            maxWidth: "440px",
            lineHeight: 1.75,
          }}
        >
          Personalize your greeting, leave a message, and watch the feed grow.
        </p>

        {/* Greeting card */}
        <div
          className="card anim-fade-in-up delay-400"
          style={{
            width: "min(440px, 100%)",
            padding: "24px 28px",
            display: "flex",
            flexDirection: "column",
            gap: "14px",
          }}
        >
          <label
            htmlFor="hero-name"
            style={{
              fontSize: "12px",
              color: "var(--fg-muted)",
              textAlign: "left",
              letterSpacing: "0.04em",
              textTransform: "uppercase",
            }}
          >
            Your name
          </label>
          <input
            id="hero-name"
            className="input-field"
            type="text"
            placeholder="e.g. Carlo"
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            maxLength={40}
            style={{
              borderRadius: "10px",
              padding: "10px 14px",
              fontSize: "15px",
              width: "100%",
            }}
          />
          <div
            style={{
              minHeight: "32px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {loading ? (
              <span style={{ color: "var(--fg-faint)", fontSize: "14px" }}>
                ···
              </span>
            ) : greeting ? (
              <span
                key={greeting.message}
                className="cursor-blink anim-fade-in"
                style={{
                  fontSize: "1.2rem",
                  fontWeight: 600,
                  color: "var(--accent-bright)",
                  letterSpacing: "-0.01em",
                }}
              >
                {greeting.message}
              </span>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
