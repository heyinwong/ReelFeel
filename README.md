# ReelFeel: An AI-Powered Mood-Based Movie Recommender

> A full-stack personal project exploring the use of LLM agents in mood-driven movie recommendations.

## ✅ Current Features

- Mood-based movie recommendation (GPT + TMDB API)
- User login and JWT authentication (FastAPI + bcrypt)
- Watched list with rating, mood tagging, comment, and like/dislike
- Waiting list (To-Watch movies)
- Taste modeling system (GPT-based snapshot & persona summary)
- Dashboard-ready APIs (`/taste-summary`, `/snapshot-history`)

---

## Getting Started

### Backend (FastAPI)

1. **(Optional) Set up virtual environment**:

   ```bash
   python3 -m venv venv_reelfeel
   source venv_reelfeel/bin/activate  # macOS/Linux
   ```

2. **Install dependencies**:

   ```bash
   pip install -r requirements.txt
   ```

3. **Start backend server** (default: http://localhost:8000):

   ```bash
   uvicorn main:app --reload
   ```

---

### Frontend (React)

> _To be added soon — frontend under active development._

To start dev server (if already set up):

```bash
npm install
npm run dev
```

---

## Environment Variables

Create and export your API keys as environment variables before running the app:

```bash
export OPENAI_API_KEY=your_openai_key
export TMDB_API_KEY=your_tmdb_key
export MOVIE_PASS_KEY=your_jwt_secret_key
```

---

## Folder Structure (optional)

```
/backend
  ├── main.py
  ├── models.py
  ├── auth.py
  ├── database.py
  └── base.py

/frontend
  └── ... (in progress)
```
