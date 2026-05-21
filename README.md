# 🌌 Nigris

Nigris is a modern developer platform with a built-in headless database, collection manager, activity logs, and real-time AI-powered system health & performance insights.

---

## 🧠 AI Intelligence Feature & Deployed Applications

Nigris features a built-in **Intelligence Dashboard** powered by **Ollama** (`llama3`).

### How it Works:
- **Local Development**:
  - Automatically connects to your local Ollama daemon running at `http://localhost:11434/api/generate` (defined in `server/.env`).
- **Local Docker Setup**:
  - Automatically bridges to the host Mac's global Ollama instance at `http://host.docker.internal:11434/api/generate` (defined in `docker-compose.yml`).
- **Deployed Applications (e.g., Render/Cloud)**:
  - **With Custom Ollama Server**: If you host Ollama in the cloud (e.g., on a VPS, RunPod, or tunnel it securely), set the `OLLAMA_URL` environment variable on your Render backend to your public endpoint.
  - **Graceful Fallback Mode**: If `OLLAMA_URL` is offline or not configured, the backend automatically activates the **Intelligent Mock Fallback Mode**. This generates realistic, rich, and randomized insights (health scores, recommendations, predictive scaling, and security anomalies) so the dashboard works perfectly and remains interactive in production.

---

## 🛠️ Configuration & Environment Variables

Configure the AI features using the following environment variables in your deployment panel (e.g., Render) or `.env` files:

| Variable | Description | Default | Example |
|---|---|---|---|
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