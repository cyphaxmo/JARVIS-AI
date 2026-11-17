import "dotenv/config";
import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";

const app = express();
const port = Number(process.env.PORT || 3001);
const here = path.dirname(fileURLToPath(import.meta.url));
const clientDist = path.resolve(here, "../../client/dist");

app.use(express.json({ limit: "32kb" }));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "jarvis-api" });
});

app.post("/api/chat", async (req, res) => {
  try {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return res.status(503).json({ error: "The AI service is not configured. Add GROQ_API_KEY to the hosting service environment." });
    }

    const messages = req.body?.messages;
    if (!Array.isArray(messages) || messages.length === 0 || messages.length > 30) {
      return res.status(400).json({ error: "Send between 1 and 30 messages." });
    }

    const safeMessages = messages.map((message) => {
      if (!message || !["user", "assistant"].includes(message.role) || typeof message.content !== "string") {
        throw new Error("Each message must have a valid role and text content.");
      }
      return { role: message.role, content: message.content.slice(0, 8000) };
    });

    const upstream = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: process.env.GROQ_MODEL || "openai/gpt-oss-120b",
        messages: [
          {
            role: "system",
            content: "You are JARVIS, a capable, precise personal AI assistant. Be transparent about uncertainty and never claim to have performed an action unless a connected tool confirms it. Ask for confirmation before consequential external actions."
          },
          ...safeMessages
        ],
        temperature: 0.6,
        max_tokens: 1200
      })
    });

    const data = await upstream.json().catch(() => ({}));
    if (!upstream.ok) {
      console.error("Groq request failed:", upstream.status, data?.error?.message || "Unknown provider error");
      return res.status(502).json({ error: "The AI provider request failed. Check the server configuration and provider status." });
    }

    const reply = data?.choices?.[0]?.message?.content;
    if (typeof reply !== "string" || !reply.trim()) {
      return res.status(502).json({ error: "The AI provider returned an empty response." });
    }

    res.json({ reply });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected server error";
    res.status(400).json({ error: message });
  }
});

// Serve the built React app from the same origin as the API.
app.use(express.static(clientDist));
app.get("*", (_req, res) => {
  res.sendFile(path.join(clientDist, "index.html"), (error) => {
    if (error) res.status(404).send("JARVIS frontend has not been built yet.");
  });
});

app.listen(port, "0.0.0.0", () => {
  console.log(`JARVIS listening on port ${port}`);
});
