# Karnataka Yatra AI (ಕರ್ನಾಟಕ ಯಾತ್ರೆ AI) 🚩
> **AI-Powered Autonomous & Rain-Adaptive Travel Planner for Karnataka**  
> *Built for the **Kannada Digital Innovation Hackathon 2026** — The National Institute of Engineering (NIE), Mysuru in collaboration with **Adaption Labs**.*  
> **Theme:** *Code. Create. Celebrate Kannada.*

[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688.svg?style=flat&logo=FastAPI)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18.0+-61DAFB.svg?style=flat&logo=React)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6.svg?style=flat&logo=TypeScript)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4+-38B2AC.svg?style=flat&logo=TailwindCSS)](https://tailwindcss.com)
[![Open-Meteo](https://img.shields.io/badge/Live_Weather-Open--Meteo-blue.svg)](https://open-meteo.com)
[![OpenStreetMap](https://img.shields.io/badge/Map_Tiles-OpenStreetMap-green.svg)](https://www.openstreetmap.org)
[![Pytest](https://img.shields.io/badge/Tests-30%20Passed-brightgreen.svg)]()

---

## 📌 Project Overview & Hackathon Alignment

**Karnataka Yatra AI** is an intelligent, culture-first travel companion built to digitize and celebrate the rich heritage, landscapes, and culinary traditions of Karnataka. Addressing the **Tourism & Heritage Promotion** track in the **Kannada Digital Innovation Hackathon 2026**, the platform solves the core challenges faced by modern travelers: fragmented regional data, inaccurate budget surprises, language barriers, and unpredictable tropical monsoon downpours.

### How it Celebrates Kannada & Karnataka:
- **100% Indic Script Localization:** Outputs day-by-day itineraries, regional dishes, and cultural tips in pure **Kannada script (ಕನ್ನಡ)**, eliminating awkward half-English transliterations. Also supports Hindi, Telugu, Tamil, Malayalam, and English.
- **Embedded Kannada Travel Phrasebook:** Equips tourists with contextual conversational Kannada (`ನಮಸ್ಕಾರ`, `ಊಟ ಆಯ್ತಾ?`, `ಎಷ್ಟು ಆಗುತ್ತೆ?`, `ದಯವಿಟ್ಟು ಸಹಾಯ ಮಾಡಿ`) with phonetic pronunciation guides.
- **Authentic Culinary Mapping:** Recommends regional dishes unique to each corridor (Mysuru Pak, Mangalorean Neer Dosa & Ghee Roast, Dharwad Peda, Jolada Rotti Oota, Coorg Pandi & Kadambuttu).
- **Adaption Labs Dataset Integration:** Ingests and rigorously evaluates curated Kannada travel pairs and held-out evaluation sets using modular adapters.

---

## 🌟 Key Technical Innovations

1. **Automated Live Weather Sensing (Zero Manual Input)**:
   - Senses real-time temperature, precipitation probability, and season from the traveler's hub city via the free **Open-Meteo API** without asking the user tedious season questions.

2. **Real-Time Rain-Adaptive Itinerary Engine**:
   - If precipitation or sudden downpours are detected in the region, outdoor activities are automatically swapped for sheltered indoor sanctuaries (e.g. *Amba Vilas Palace interior darbar halls, Visvesvaraya Science Museum, Kamalapura Archaeological Gallery, Coffee Cupping Labs in Coorg*).

3. **Deterministic Mathematical Budget Engine**:
   - Unlike generic AI chatbots that hallucinate travel costs, Karnataka Yatra AI computes 100% line-item balanced budgets (Accommodation, Food, Transit, Entry Fees, Contingency Reserve) scaled dynamically by party size and room allocation rules.

4. **Zero-API-Key Interactive Map**:
   - Features real-time visual route tracking and distance estimation powered by official **OpenStreetMap** tile layers and Leaflet.

5. **Instant Mobile WhatsApp Sharing**:
   - One-click export to WhatsApp with clean Unicode formatting, line-item breakdowns, and emergency contacts.

1. **Deterministic Budget Engine**:
   - Computes transparent line-item allocations for accommodation, food, transport, entry fees, and safety contingency reserves.
   - Triggers explicit warnings when requested budgets cannot realistically support the selected duration or transport mode (zero fabricated prices).

2. **Regional Clustering & Pacing**:
   - Intelligently groups destinations by regional corridors (`coastal`, `western_ghats`, `heritage_circuit`, `southern_karnataka`, `north_karnataka`) to eliminate impractical zig-zag travel.

3. **Multilingual & Cultural Intelligence**:
   - Supports 6 regional languages (English, Kannada, Hindi, Telugu, Tamil, Malayalam).
   - Includes authentic local cuisine recommendations (Neer Dosa, Jolada Rotti, Mysore Pak, Coorg Kadambuttu, Mangalorean Ghee Roast) and an essential Kannada travel phrasebook.

4. **One-Click Circuit Presets**:
   - Ready-to-launch signature circuits: Hoysala Heritage Trail, Karavali Beach & Temple Odyssey, Western Ghats Monsoon Retreat, and Royal Mysore & Kabini Tiger Safari.

5. **Itinerary Revision Engine**:
   - Real-time modifications (e.g. "reduce budget by 20%", "add more heritage places", "switch to public transit").

6. **Adaption Labs Dataset Ingestion Adapter**:
   - Built with an Adapter Pattern (`DatasetAdapter`) to ingest future datasets from Adaption Labs without hardcoded column assumptions.

---

## Technology Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons, React Router v6.
- **Backend**: Python 3.10+, FastAPI, Pydantic v2, Uvicorn, Pytest, HTTPX.
- **Architecture**: Modular service-oriented design with clear provider interfaces for routing and LLMs.

---

## Project Structure

```
karnataka-yatra-ai/
  frontend/
    src/
      components/          # Navbar, Footer, BudgetBreakdownCard, DayItineraryCard, RouteMap, RevisionPanel, etc.
      pages/               # LandingPage, PlannerPage, ResultsPage, DestinationsPage
      services/            # api.ts (FastAPI client)
      types/               # travel.ts (Pydantic-mirrored TypeScript interfaces)
      data/                # karnatakaConstants.ts (circuits, languages, interests)
      App.tsx
      main.tsx
    public/
    package.json
    vite.config.ts
    tailwind.config.js
    .env.example
  backend/
    app/
      api/                 # FastAPI routes (/health, /destinations, /plan, /validate, /revise)
      core/                # config.py (Pydantic Settings)
      models/              # Schema definitions
      schemas/             # Pydantic v2 validation models
      services/            # Destination, Budget, Itinerary, Validation, Routing, LLMProvider, DatasetLoader
      data/                # sample_destinations.json (curated Karnataka hubs)
      main.py              # FastAPI app entry with CORS & lifespan
    tests/                 # Pytest test suite (destinations, budget, itinerary, api)
    requirements.txt
    .env.example
  data/
    README.md              # Ingestion guidelines for Adaption Labs datasets
  docs/
    ARCHITECTURE.md        # System architecture & Mermaid flowcharts
    API.md                 # Full REST API endpoint specifications
  .gitignore
  README.md
```

---

## Windows Setup & Execution Guide

### Prerequisites
- Python 3.10 or higher (`python --version`)
- Node.js 18 or higher & npm (`node -v`, `npm -v`)
- Git / PowerShell

---

### Step 1: Backend Setup (FastAPI)

1. Open PowerShell and navigate to the project directory:
   ```powershell
   cd c:\Kannada_Travel_guide_AI
   ```

2. Create and activate a Python virtual environment:
   ```powershell
   python -m venv backend\venv
   backend\venv\Scripts\Activate.ps1
   ```

3. Install Python dependencies:
   ```powershell
   pip install -r backend\requirements.txt
   ```

4. Configure environment variables (optional for default deterministic mode):
   ```powershell
   Copy-Item backend\.env.example backend\.env
   ```

5. Run automated backend tests:
   ```powershell
   $env:PYTHONPATH="."
   backend\venv\Scripts\pytest backend\tests -v
   ```

6. Start the FastAPI development server:
   ```powershell
   backend\venv\Scripts\uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload
   ```

The backend is now live at:
- API Base: `http://localhost:8000`
- Interactive Swagger Docs: `http://localhost:8000/docs`
- Health check: `http://localhost:8000/health`

---

### Step 2: Frontend Setup (React + Vite + Tailwind)

1. Open a new PowerShell window:
   ```powershell
   cd c:\Kannada_Travel_guide_AI\frontend
   ```

2. Install dependencies:
   ```powershell
   npm install
   ```

3. Configure environment variables:
   ```powershell
   Copy-Item .env.example .env
   ```

4. Start the Vite dev server:
   ```powershell
   npm run dev
   ```

The frontend application is now live at:
- Web App: `http://localhost:5173`

---

## API Endpoints Summary

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/health` | Service health status & loaded destinations count |
| `GET` | `/api/v1/destinations` | Search and filter destinations by region/interest |
| `POST` | `/api/v1/trips/validate` | Pre-flight validation of budget and pace feasibility |
| `POST` | `/api/v1/trips/plan` | Generate personalized day-wise itinerary |
| `POST` | `/api/v1/trips/revise` | Deterministically modify an existing itinerary |

---

## Adaption Labs Dataset Ingestion

When the Adaption Labs dataset is available:
1. Place the raw JSON or CSV in `data/`.
2. Inspect the fields using `DatasetAdapter.normalize_record()`.
3. The adapter dynamically maps alternative column titles (`place_name`, `hotel_rate`, `about`) and flags data with `is_sample_or_estimated = True` to preserve booking integrity.

---

## License & Attribution
Developed for the Karnataka Tourism Hackathon. Sample landmark figures are realistic standard-season estimates for planning simulation.
