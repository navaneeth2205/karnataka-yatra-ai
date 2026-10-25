# 🚀 Deployment Guide — Karnataka Yatra AI

Karnataka Yatra AI is engineered as a **unified full-stack application**. When deployed, the Python FastAPI backend serves both the REST API (`/api/v1/...`) and the pre-built React Vite frontend from a single web service. This guarantees:
- **Zero CORS issues** (frontend and backend live on the same origin)
- **100% Free** (only 1 free-tier service needed)
- **Zero Configuration** (works out-of-the-box with deterministic algorithms, no mandatory API keys)

---

## Option 1: Render (Recommended — 100% Free, 1-Click Setup)

Render offers a generous **Free Web Service** tier with automatic HTTPS and continuous deployment from GitHub.

### Step-by-Step Instructions:
1. Go to [https://render.com](https://render.com) and sign in with your GitHub account (**navaneeth2205**).
2. Click **New +** in the top navigation bar and select **Blueprint**.
3. Select your repository: `navaneeth2205/karnataka-yatra-ai`.
4. Render will automatically detect [`render.yaml`](./render.yaml) and configure the build settings:
   - **Service Name:** `karnataka-yatra-ai`
   - **Environment:** `Python`
   - **Plan:** `Free`
   - **Build Command:** `npm --prefix frontend install && npm --prefix frontend run build && pip install -r backend/requirements.txt`
   - **Start Command:** `uvicorn backend.app.main:app --host 0.0.0.0 --port $PORT`
5. Click **Apply**.
6. Render will build the React frontend and deploy the FastAPI backend. In 2–3 minutes, your live URL will be active at:
   `https://karnataka-yatra-ai.onrender.com`

---

## Option 2: Hugging Face Spaces (100% Free, 16GB RAM)

Hugging Face Spaces is an outstanding platform for AI hackathons, offering 100% free hosting with 16GB RAM and 2 vCPUs.

### Step-by-Step Instructions:
1. Go to [https://huggingface.co/spaces](https://huggingface.co/spaces) and click **Create new Space**.
2. Set Space Name: `karnataka-yatra-ai`.
3. Select **Space SDK**: **Docker** (Blank).
4. Space Hardware: **Free (CPU basic • 2 vCPU • 16GB RAM)**.
5. In your local terminal, add the Hugging Face remote and push:
   ```bash
   git remote add space https://huggingface.co/spaces/YOUR_USERNAME/karnataka-yatra-ai
   git push space main
   ```
6. Hugging Face will automatically run the multi-stage [`Dockerfile`](./Dockerfile) and host your app live!

---

## Option 3: Koyeb (100% Free Nano Docker Service)

1. Go to [https://app.koyeb.com](https://app.koyeb.com) and log in with GitHub.
2. Click **Create App** → **GitHub**.
3. Select `navaneeth2205/karnataka-yatra-ai`.
4. Choose **Dockerfile** as builder.
5. Select the **Free Eco (Nano)** instance type.
6. Click **Deploy**. Your app will be live at `https://karnataka-yatra-ai.koyeb.app`.

---

## Option 4: Vercel (Frontend) + Render (Backend)

If you prefer hosting the React frontend separately on Vercel:
1. Import `navaneeth2205/karnataka-yatra-ai` into [Vercel](https://vercel.com).
2. Set Root Directory to `frontend`.
3. Add Environment Variable:
   - `VITE_API_BASE_URL` = `https://your-backend-service.onrender.com`
4. Deploy!
