# An in-process mini project (Reel Feel), relates to use ai agent on movie recommendation based on mood.

Potential functions to have:

- Obviously the ai recommendation
- Log in system
- watched list and rating/like,hate system
- waiting list (to watch)

## folder structure

ReelFeel/
├── backend/ # FastAPI 后端
├── frontend/ # React 前端
└── README.md

## to start

### backend（FastAPI）

1. (optional) start the virtual environment：

   ```bash
   python3 -m venv venv_reelfeel #you can name it whatever
   source venv_reelfeel/bin/activate  # macOS/Linux
   ```

2. install dependencies：

   ```bash
   pip install -r requirements.txt
   ```

3. start local host（default http://localhost:8000）：

   ```bash
   uvicorn main:app --reload
   ```

---

### frontend（React）

1. start local host（default http://localhost:5173）：

   ```bash
   npm run dev
   ```

---

### api key and environmental variable

set API key as environmental variable like this：

```bash
export GEMINI_API_KEY=your_api_key_here
```
