from services.openai_service import chat_text
from services.taste_service import regenerate_taste_summary


async def create_chat_completion(messages, model=None, temperature=0.7, max_tokens=None):
    content = await chat_text(
        messages,
        tier="standard",
        temperature=temperature,
        max_tokens=max_tokens,
    )

    class Message:
        def __init__(self, text):
            self.content = text

    class Choice:
        def __init__(self, text):
            self.message = Message(text)

    class Response:
        def __init__(self, text):
            self.choices = [Choice(text)]

    return Response(content)


async def generate_snapshot_comment(
    movie_title,
    user_rating,
    review,
    mood_tags,
    genres=None,
    director=None,
    release_year=None,
):
    prompt = (
        "Analyze one movie log and return one concise second-person taste observation. "
        "Use the user's 10-point rating correctly: 8-10 is strong affinity, 5-7 is mixed/neutral, 1-4 is low affinity. "
        f"Movie: {movie_title}; rating={user_rating}; review={review}; moods={mood_tags}; "
        f"genres={genres}; director={director}; year={release_year}."
    )
    return await chat_text(
        [{"role": "user", "content": prompt}],
        tier="cheap",
        temperature=0.4,
        max_tokens=160,
    )
