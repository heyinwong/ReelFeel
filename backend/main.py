from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from openai import OpenAI
import os

client = OpenAI()

app = FastAPI()

# 跨域允许前端调用
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 请求数据格式
class MoodInput(BaseModel):
    mood: str

# 推荐接口逻辑
@app.post("/recommend")
async def recommend_movies(data: MoodInput):
    prompt = f"Give me 3 movie recommendations that match the mood: '{data.mood}'"
    
    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
        )
        text = response.choices[0].message.content.strip()
        return {"recommendations": text}
    except Exception as e:
        return {"error": str(e)}