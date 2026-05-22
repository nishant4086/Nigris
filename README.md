# 🌌 Nigris

Nigris is a modern developer platform with a built-in headless database, collection manager, activity logs, and real-time AI-powered system health & performance insights.

---

## 🧠 AI Intelligence Feature & Deployed Applications

Nigris features a built-in **Intelligence Dashboard** powered by your choice of local or cloud AI models.

### How it Works:
- **Local Development**:
  - Automatically connects to your local Ollama daemon running at `http://localhost:11434/api/generate` (defined in `server/.env`).
- **Local Docker Setup**:
  - Automatically bridges to the host Mac's global Ollama instance at `http://host.docker.internal:11434/api/generate` (defined in `docker-compose.yml`).
- **Deployed Applications (e.g., Render/Cloud)**:
  - **Google Gemini (Recommended)**: Set the `GEMINI_API_KEY` environment variable in your cloud provider dashboard (e.g., Render). The application will query `gemini-2.5-flash` to generate real AI insights for free/production use.
  - **OpenAI**: Set the `OPENAI_API_KEY` environment variable in your cloud provider dashboard to query `gpt-4o-mini` for live AI reports.
  - **Custom Ollama Server**: Alternatively, if you host Ollama in the cloud, set the `OLLAMA_URL` environment variable.
  - **Graceful Fallback Mode**: If no cloud keys/endpoints are configured or they are offline, the backend automatically activates the **Intelligent Mock Fallback Mode** so the dashboard works perfectly and remains interactive in production.

---

## 🛠️ Configuration & Environment Variables

Configure the AI features using the following environment variables in your deployment panel (e.g., Render) or `.env` files:

| Variable | Description | Default / Recommended | Example |
|---|---|---|---|
| `GEMINI_API_KEY` | Google Gemini API key (for live cloud AI) | None | `AIzaSy...` |
| `OPENAI_API_KEY` | OpenAI API key (for live cloud AI) | None | `sk-proj-...` |
| `OLLAMA_URL` | The endpoint of the Ollama generation API | `http://localhost:11434/api/generate` | `https://your-public-ollama-api.com/api/generate` |
| `OLLAMA_MODEL` | The model to use for generating insights | `llama3` | `llama3` / `mistral` |

---

## 🚀 Local Quickstart

### Running natively on Host Mac:
1. Ensure Ollama is running (`ollama serve`) and the model is downloaded (`ollama run llama3`).
2. Start the backend:
   ```bash
   cd server
   npm install
   npm run dev
   ```
3. Start the frontend:
   ```bash
   cd client
   npm install
   npm run dev
   ```

### Running via Docker Compose:
```bash
docker compose up --build
```
*(Your containerized server will automatically bridge to your local/global host Ollama instance).*