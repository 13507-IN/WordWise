"use client";

import { ArrowUp, Bot, RotateCcw } from "lucide-react";
import { useState, type FormEvent } from "react";

type Message = { role: "user" | "assistant"; content: string };

export function TutorChat({ examName, level }: { examName: string; level: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function send(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const content = input.trim();
    if (!content || busy) return;
    const nextMessages = [...messages, { role: "user" as const, content }];
    setMessages(nextMessages);
    setInput("");
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages.slice(-10) }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "The tutor could not respond.");
      setMessages([...nextMessages, { role: "assistant", content: result.reply }]);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "The tutor could not respond.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="tutor-panel">
      <div className="tutor-panel-head">
        <div className="tutor-avatar"><Bot aria-hidden="true" /></div>
        <div><strong>{examName} {level} tutor</strong><span>Personalized to your target level</span></div>
        <button className="tutor-reset" type="button" disabled={!messages.length || busy} onClick={() => { setMessages([]); setError(""); }}>
          <RotateCcw aria-hidden="true" size={15} /> Clear
        </button>
      </div>
      <div className="tutor-messages" aria-live="polite">
        {messages.length ? messages.map((message, index) => (
          <article className={`tutor-message ${message.role}`} key={`${message.role}-${index}`}>
            <span>{message.role === "user" ? "You" : "Tutor"}</span>
            <p>{message.content}</p>
          </article>
        )) : (
          <div className="tutor-empty">
            <Bot aria-hidden="true" size={28} />
            <h2>What are you working on?</h2>
            <p>Try “Explain this grammar point” or “Give me five original vocabulary questions.”</p>
          </div>
        )}
        {busy && <div className="tutor-message assistant"><span>Tutor</span><p>Thinking through your question…</p></div>}
      </div>
      {error && <p className="form-error tutor-error" role="alert">{error}</p>}
      <form className="tutor-compose" onSubmit={send}>
        <label className="sr-only" htmlFor="tutor-message">Ask your tutor</label>
        <textarea
          id="tutor-message"
          maxLength={1800}
          rows={2}
          placeholder="Ask a question about your target exam…"
          value={input}
          onChange={(event) => setInput(event.target.value)}
        />
        <button className="button" type="submit" disabled={busy || !input.trim()} aria-label="Send message">
          <ArrowUp aria-hidden="true" size={18} /> Send
        </button>
      </form>
      <p className="tutor-disclaimer">Your conversation is not stored in your LinguaCamp account. Do not enter sensitive personal information.</p>
    </section>
  );
}
