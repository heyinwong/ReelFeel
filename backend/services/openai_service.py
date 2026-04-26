import json
import re
from typing import Any, Literal

from openai import AsyncOpenAI

from config import (
    AI_USAGE_LOGGING,
    OPENAI_CHEAP_INPUT_COST_PER_1M,
    OPENAI_CHEAP_OUTPUT_COST_PER_1M,
    OPENAI_API_KEY,
    OPENAI_MAX_TOKENS_CHEAP,
    OPENAI_MAX_TOKENS_STANDARD,
    OPENAI_MODEL_CHEAP,
    OPENAI_MODEL_STANDARD,
    OPENAI_STANDARD_INPUT_COST_PER_1M,
    OPENAI_STANDARD_OUTPUT_COST_PER_1M,
)

TaskTier = Literal["cheap", "standard"]


def get_model(tier: TaskTier = "standard") -> str:
    return OPENAI_MODEL_CHEAP if tier == "cheap" else OPENAI_MODEL_STANDARD


def get_max_tokens(tier: TaskTier = "standard") -> int:
    return OPENAI_MAX_TOKENS_CHEAP if tier == "cheap" else OPENAI_MAX_TOKENS_STANDARD


def estimate_cost_usd(tier: TaskTier, prompt_tokens: int, completion_tokens: int) -> float:
    if tier == "cheap":
        input_cost = OPENAI_CHEAP_INPUT_COST_PER_1M
        output_cost = OPENAI_CHEAP_OUTPUT_COST_PER_1M
    else:
        input_cost = OPENAI_STANDARD_INPUT_COST_PER_1M
        output_cost = OPENAI_STANDARD_OUTPUT_COST_PER_1M
    return (prompt_tokens / 1_000_000 * input_cost) + (
        completion_tokens / 1_000_000 * output_cost
    )


async def record_usage(
    *,
    user_id: int | None,
    task: str,
    tier: TaskTier,
    model: str,
    prompt_tokens: int,
    completion_tokens: int,
):
    if not AI_USAGE_LOGGING:
        return
    try:
        from database import async_session
        from models import LlmUsage

        total_tokens = prompt_tokens + completion_tokens
        async with async_session() as session:
            session.add(
                LlmUsage(
                    user_id=user_id,
                    task=task,
                    tier=tier,
                    model=model,
                    prompt_tokens=prompt_tokens,
                    completion_tokens=completion_tokens,
                    total_tokens=total_tokens,
                    estimated_cost_usd=estimate_cost_usd(tier, prompt_tokens, completion_tokens),
                )
            )
            await session.commit()
    except Exception as exc:
        print("[ai usage logging failed]:", exc)


def get_client() -> AsyncOpenAI:
    if not OPENAI_API_KEY:
        raise RuntimeError("OPENAI_API_KEY is not configured")
    return AsyncOpenAI(api_key=OPENAI_API_KEY)


async def chat_text(
    messages: list[dict[str, str]],
    *,
    tier: TaskTier = "standard",
    temperature: float = 0.4,
    max_tokens: int | None = None,
    task: str = "chat_text",
    user_id: int | None = None,
) -> str:
    client = get_client()
    model = get_model(tier)
    response = await client.chat.completions.create(
        model=model,
        messages=messages,
        temperature=temperature,
        max_tokens=max_tokens or get_max_tokens(tier),
    )
    usage = response.usage
    if usage:
        await record_usage(
            user_id=user_id,
            task=task,
            tier=tier,
            model=model,
            prompt_tokens=usage.prompt_tokens or 0,
            completion_tokens=usage.completion_tokens or 0,
        )
    return response.choices[0].message.content.strip()


async def chat_json(
    messages: list[dict[str, str]],
    *,
    tier: TaskTier = "standard",
    temperature: float = 0.3,
    max_tokens: int | None = None,
    fallback: Any = None,
    task: str = "chat_json",
    user_id: int | None = None,
):
    raw = await chat_text(
        messages,
        tier=tier,
        temperature=temperature,
        max_tokens=max_tokens,
        task=task,
        user_id=user_id,
    )
    return parse_json_payload(raw, fallback)


def parse_json_payload(raw: str, fallback: Any = None):
    text = (raw or "").strip()
    if not text:
        return fallback

    candidates = [text]
    fenced = re.fullmatch(r"```(?:json)?\s*(.*?)\s*```", text, flags=re.IGNORECASE | re.DOTALL)
    if fenced:
        candidates.insert(0, fenced.group(1).strip())

    for candidate in candidates:
        try:
            return json.loads(candidate)
        except json.JSONDecodeError:
            pass

    for opening, closing in (("{", "}"), ("[", "]")):
        start = text.find(opening)
        end = text.rfind(closing)
        if start != -1 and end != -1 and end > start:
            try:
                return json.loads(text[start : end + 1])
            except json.JSONDecodeError:
                pass

    try:
        return json.loads(text)
    except json.JSONDecodeError:
        return fallback
