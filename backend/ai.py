# backend/ai.py

import openai
import os
import json
from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from models import TasteSummary, TasteSnapshot

openai.api_key = os.getenv("OPENAI_API_KEY")


async def generate_snapshot_comment(movie_title, user_rating, review, mood_tags):
    segments = []

    if user_rating:
        segments.append(f"gave it a rating of {user_rating}")
    if review:
        segments.append(f"commented: \"{review}\"")
    if mood_tags:
        mood_str = ", ".join(mood_tags) if isinstance(mood_tags, list) else mood_tags
        segments.append(f"tagged your mood as: {mood_str}")

    if not segments:
        segments_text = "watched the movie but gave no specific input"
    else:
        segments_text = "; ".join(segments)

    prompt = (
        "You are an AI assistant giving personal feedback to the user based on their recent movie behavior.\n"
        f"You watched '{movie_title}' and {segments_text}.\n"
        "Write a short sentence (1–2 lines) addressing the user directly, describing what this says about your taste or preferences."
    )

    try:
        response = openai.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7,
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        print("Error generating snapshot comment:", e)
        return "Your behavior is unclear, but it may still reflect a unique taste."


async def regenerate_taste_summary(session: AsyncSession, user_id: int):
    result = await session.execute(
        select(TasteSnapshot)
        .where(TasteSnapshot.user_id == user_id)
        .order_by(TasteSnapshot.timestamp.asc())
    )
    snapshots = result.scalars().all()

    user_insights = []
    behavior_observations = []

    for snap in snapshots:
        if snap.action_type == "correction":
            user_insights.append(f'"{snap.gpt_comment}"')
        elif snap.gpt_comment:
            behavior_observations.append(snap.gpt_comment)

    # 构造 prompt
    prompt = "You are building a personalized movie taste profile for the user.\n\n"

    if user_insights:
        prompt += "Insights explicitly provided by the user:\n"
        for insight in user_insights:
            prompt += f"- {insight}\n"
        prompt += "\n"

    if behavior_observations:
        prompt += "Observations based on the user's reviews, moods, and preferences:\n"
        for obs in behavior_observations:
            prompt += f"- {obs}\n"
        prompt += "\n"

    prompt += (
        "Based on the above, write a concise and expressive paragraph summarizing the user's movie taste. "
        "Use 'you' to address the user directly. Prioritize user-provided insights, but integrate both sources naturally."
    )

    try:
        response = openai.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7,
        )
        summary = response.choices[0].message.content.strip()
    except Exception as e:
        print("Error during summary generation:", e)
        summary = "Your profile could not be updated at the moment."

    # 更新数据库
    result = await session.execute(
        select(TasteSummary).where(TasteSummary.user_id == user_id)
    )
    record = result.scalar_one_or_none()
    if record:
        record.summary = summary
    else:
        session.add(TasteSummary(user_id=user_id, summary=summary))

