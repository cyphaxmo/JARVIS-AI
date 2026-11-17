# JARVIS AI

A mobile-friendly starter for a personal AI assistant, built with React, Vite, Node.js, Express, and the Groq API.

## Architecture

- `client/`: React interface served by Vite during development.
- `server/`: Express API. The Groq API key stays on the server and is read from an environment variable.
- The browser calls only your own `/api/chat` endpoint; it never receives the provider secret.

## Requirements

- Node.js 20 or newer
- A Groq API key created in your own Groq account

## Configure

1. Open a terminal in the repository.
2. In `server/`, copy `.env.example` to `.env`.
3. Put your newly generated key in `GROQ_API_KEY`. Never paste it into React code or commit `.env`.
4. Install dependencies in both folders:

```bash
cd server && npm install
cd ../client && npm install
```

5. Start the API in one terminal:

```bash
cd server && npm run dev
```

6. Start the web app in another terminal:

```bash
cd client && npm run dev
```

Open the local URL printed by Vite.

## Environment variables

See `server/.env.example`. Set `GROQ_MODEL` to a model currently available to your Groq account. The example uses `llama-3.3-70b-versatile`; provider model availability can change.

## Current scope

This is a development starter: chat UI, health endpoint, basic input validation, and server-side provider requests. It does not yet include user accounts, durable conversation memory, speech input/output, web search, tool execution, or deployment configuration.

Before exposing it publicly, add authentication, per-user rate limits, request-size limits, HTTPS, abuse monitoring, and persistent storage. Treat all model output and user input as untrusted data. Require explicit confirmation before any consequential external action.
