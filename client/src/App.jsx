import { useState } from "react";
import { Activity, AudioLines, Cpu, Send, ShieldCheck, Sparkles } from "lucide-react";

const starterPrompts = [
  "Explain what you can help me with",
  "Help me plan my day",
  "Explain a difficult topic simply"
];

export default function App() {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "JARVIS systems are online. What would you like to work on?" }
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("READY");

  async function sendMessage(text = input) {
    const content = text.trim();
    if (!content || busy) return;

    const next = [...messages, { role: "user", content }];
    setMessages(next);
    setInput("");
    setBusy(true);
    setStatus("PROCESSING");

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next.filter((item) => item.role !== "system") })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Request failed");
      setMessages([...next, { role: "assistant", content: data.reply }]);
      setStatus("READY");
    } catch (error) {
      setMessages([...next, {
        role: "assistant",
        content: `Connection issue: ${error.message}. Check that the API server is running and configured.`
      }]);
      setStatus("CHECK CONNECTION");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="shell">
      <header className="topbar">
        <a className="brand" href="#" aria-label="JARVIS home">
          <span className="brand-mark"><AudioLines size={21} /></span>
          <span>J.A.R.V.I.S.<small>PERSONAL INTELLIGENCE</small></span>
        </a>
        <div className="status"><span className="status-dot" /> {status}</div>
      </header>

      <section className="hero">
        <div className="eyebrow"><span /> PERSONAL AI INTERFACE</div>
        <h1>Good day.<br /><em>How can I assist?</em></h1>
        <p>Your workspace for thinking, learning, research, and getting things done.</p>
      </section>

      <section className="system-grid" aria-label="System status">
        <div className="system-card"><Activity /><span>CORE STATUS</span><strong>Operational UI</strong></div>
        <div className="system-card"><Cpu /><span>AI ENGINE</span><strong>Groq API</strong></div>
        <div className="system-card"><ShieldCheck /><span>KEY SECURITY</span><strong>Server-side</strong></div>
      </section>

      <section className="workspace">
        <div className="section-heading"><div><span className="eyebrow">CONVERSATION</span><h2>Ask JARVIS</h2></div><Sparkles size={19} /></div>
        <div className="chat-window" aria-live="polite">
          {messages.map((message, index) => (
            <article className={`message ${message.role}`} key={index}>
              <span className="message-label">{message.role === "assistant" ? "JARVIS" : "YOU"}</span>
              <p>{message.content}</p>
            </article>
          ))}
          {busy && <div className="thinking"><span /> JARVIS is processing</div>}
        </div>
        <div className="prompt-row">
          {starterPrompts.map((prompt) => (
            <button key={prompt} className="suggestion" onClick={() => sendMessage(prompt)} disabled={busy}>{prompt}</button>
          ))}
        </div>
        <form className="composer" onSubmit={(event) => { event.preventDefault(); sendMessage(); }}>
          <input value={input} onChange={(event) => setInput(event.target.value)} placeholder="Message JARVIS..." aria-label="Message JARVIS" />
          <button type="submit" disabled={busy || !input.trim()} aria-label="Send message"><Send size={18} /></button>
        </form>
        <p className="disclaimer">JARVIS can make mistakes. Verify important information before acting on it.</p>
      </section>
      <footer>JARVIS AI <span>·</span> PRIVATE ASSISTANT PROJECT</footer>
    </main>
  );
}
