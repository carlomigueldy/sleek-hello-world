"use client";

import { useState } from "react";
import HeroGreeting from "@/components/HeroGreeting";
import MessageForm from "@/components/MessageForm";
import FeaturedMessage from "@/components/FeaturedMessage";
import MessageFeed, { type Message } from "@/components/MessageFeed";
import ServerPing from "@/components/ServerPing";

export default function Home() {
  const [name, setName]                   = useState("");
  const [latestMessage, setLatestMessage] = useState<Message | null>(null);

  return (
    <>
      <HeroGreeting name={name} onNameChange={setName} />

      <main
        className="anim-fade-in-up delay-500"
        style={{
          width: "100%",
          maxWidth: "680px",
          margin: "0 auto",
          padding: "24px 16px 96px",
          display: "flex",
          flexDirection: "column",
          gap: "24px",
        }}
      >
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <ServerPing />
        </div>

        <MessageForm authorHint={name} onMessageSent={setLatestMessage} />
        <FeaturedMessage />
        <MessageFeed newMessage={latestMessage} />
      </main>
    </>
  );
}
