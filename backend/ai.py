# backend/ai.py

import openai
import os
import json
from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from models import TasteSummary, TasteSnapshot

openai.api_key = os.getenv("OPENAI_API_KEY")


async def generate_snapshot_comment(
    movie_title,
    user_rating,
    review,
    mood_tags,
    genres=None,
    director=None,
    release_year=None,
):
    bullet = []

    if user_rating:
        bullet.append(f"You rated it {user_rating}/5.")
    if review:
        bullet.append(f"You wrote: \"{review}\"")
    if mood_tags:
        bullet.append(f"You tagged it with mood(s): {mood_tags}.")
    if genres:
        bullet.append(f"Its genres include: {genres}.")
    if director:
        bullet.append(f"It was directed by {director}.")
    if release_year:
        bullet.append(f"It was released in {release_year}.")

    bullet_points = "\n".join(f"- {item}" for item in bullet) if bullet else "No personal input was provided."

    prompt = (
        f"You are an AI assistant analyzing a user's recent film experience.\n"
        f"The movie was '{movie_title}'. Here's what we know:\n{bullet_points}\n\n"
        "Write a short (1–2 sentence) natural-sounding observation about what this movie choice and user behavior suggest about their personal film taste.\n"
        "Use 'you' to refer to the user directly, and be thoughtful but not overly sentimental or artificial."
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
        return "You watched a movie, but we couldn't interpret your reaction clearly."


import json

async def regenerate_taste_summary(session: AsyncSession, user_id: int):
    result = await session.execute(
        select(TasteSnapshot)
        .where(TasteSnapshot.user_id == user_id)
        .order_by(TasteSnapshot.timestamp.asc())
    )
    snapshots = result.scalars().all()

    if not snapshots:
        # 无 snapshot，清空 summary
        result = await session.execute(
            select(TasteSummary).where(TasteSummary.user_id == user_id)
        )
        record = result.scalar_one_or_none()
        if record:
            record.summary = ""
            record.highlight_titles = json.dumps([])
        else:
            session.add(TasteSummary(
                user_id=user_id,
                summary="",
                highlight_titles=json.dumps([])
            ))
        await session.commit()
        return

    user_insights = []
    behavior_observations = []

    for snap in snapshots:
        if snap.action_type == "correction":
            user_insights.append(f'"{snap.gpt_comment}"')
        elif snap.gpt_comment:
            behavior_observations.append(snap.gpt_comment)

    # 构造 sections
    user_insights_section = ""
    if user_insights:
        user_insights_section += "The user has directly shared the following personal insights:\n"
        for insight in user_insights:
            user_insights_section += f"- {insight}\n"

    behavior_observations_section = ""
    if behavior_observations:
        behavior_observations_section += "\nBased on the user's reviews, moods, and preferences, here are additional observations:\n"
        for obs in behavior_observations:
            behavior_observations_section += f"- {obs}\n"

    # 构造 GPT prompt
    prompt = (
        "You are an AI assistant helping a user understand their personal movie preferences.\n"
        "You've observed their reviews, moods, and direct feedback over time.\n\n"
        f"{user_insights_section}\n"
        f"{behavior_observations_section}\n"
        "Now, do two things:\n"
        "1. Write a thoughtful and cohesive summary (3–5 sentences) in a warm and perceptive tone. Use 'you' to address the user.\n"
        "   Do NOT quote earlier text directly. Focus on patterns and preferences, not individual reviews.\n"
        "2. Return a JSON object with two keys:\n"
        "   - 'summary': your summary text\n"
        "   - 'highlight_titles': an array of movie titles mentioned explicitly in the summary.\n"
        "Format your entire output as a valid JSON object. Do not include any other commentary or formatting."
    )

    try:
        response = openai.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7,
        )
        raw = response.choices[0].message.content.strip()

        try:
            parsed = json.loads(raw)
            summary_text = parsed.get("summary", "").strip()
            highlight_titles = parsed.get("highlight_titles", [])
        except Exception as parse_err:
            print("⚠️ Failed to parse JSON from GPT:", parse_err)
            summary_text = raw
            highlight_titles = []

    except Exception as e:
        print("❌ Error during summary generation:", e)
        summary_text = "Your profile could not be updated at the moment."
        highlight_titles = []

    # ✅ 更新数据库
    result = await session.execute(
        select(TasteSummary).where(TasteSummary.user_id == user_id)
    )
    record = result.scalar_one_or_none()
    if record:
        record.summary = summary_text
        record.highlight_titles = json.dumps(highlight_titles)
    else:
        session.add(TasteSummary(
            user_id=user_id,
            summary=summary_text,
            highlight_titles=json.dumps(highlight_titles)
        ))

    await session.commit()

