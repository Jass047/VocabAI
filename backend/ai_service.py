import json
import httpx
from config import (
    AI_PROVIDER, CLAUDE_API_KEY, CLAUDE_MODEL,
    GEMINI_API_KEY, GEMINI_MODEL,
    OPENROUTER_API_KEY, OPENROUTER_MODEL, OPENROUTER_URL
)

# ─── base prompts for each feature ───

ENHANCE_PROMPT = """You are a vocabulary enhancement expert. Analyze the following text and provide:
1. "readability_score": a score from 1-100 (100 = very easy to read)
2. "vocabulary_level": "basic", "intermediate", or "advanced"
3. "enhanced_text": the text rewritten with richer vocabulary
4. "suggestions": a list of objects, each with "original", "suggestion", and "reason"
5. "word_count": total words
6. "unique_words": count of unique words

Respond ONLY in valid JSON format with these exact keys. No markdown, no explanation.

Text to analyze:
{text}

Tone: {tone}"""

EXPLORE_PROMPT = """You are a vocabulary expert and teacher. For the word "{word}", provide:
1. "word": the word
2. "pronunciation": phonetic pronunciation
3. "part_of_speech": main part of speech
4. "definition": clear definition in simple English
5. "etymology": brief origin of the word
6. "difficulty": "easy", "medium", or "hard"
7. "synonyms": list of 5 synonyms
8. "antonyms": list of 3 antonyms
9. "examples": list of 3 example sentences using the word in different contexts
10. "related_words": list of 5 related words
11. "memory_tip": a memorable tip to remember this word

Respond ONLY in valid JSON format. No markdown, no explanation."""

QUIZ_PROMPT = """You are a vocabulary quiz generator for students. Generate exactly {count} quiz questions.
Difficulty: {difficulty}
Quiz type: {quiz_type}
{word_context}

For each question, provide:
- "question": the question text
- "type": "mcq", "fill_blank", or "match"
- "options": list of 4 options (for mcq) or empty list for fill_blank
- "correct_answer": the correct answer
- "explanation": brief explanation of why this is correct

Return a JSON object with key "questions" containing the list. No markdown, no explanation.
Respond ONLY in valid JSON format."""

REWRITE_PROMPT = """You are a writing style expert. Rewrite the following text in {tone} tone.
Keep the core meaning but adjust vocabulary, sentence structure, and style.

Also provide:
1. "rewritten_text": the rewritten version
2. "changes_made": list of key changes you made
3. "tone_analysis": brief analysis of the original tone vs new tone
4. "word_level_before": vocabulary level of original ("basic"/"intermediate"/"advanced")
5. "word_level_after": vocabulary level of rewritten version

Text: {text}

Respond ONLY in valid JSON format. No markdown, no explanation."""

WORD_OF_DAY_PROMPT = """Generate a "Word of the Day" for a student. Pick an interesting, 
useful but not too common English word. Provide:
1. "word": the word
2. "pronunciation": phonetic pronunciation
3. "part_of_speech": part of speech
4. "definition": clear definition
5. "example": one great example sentence
6. "fun_fact": an interesting fact about this word
7. "difficulty": "easy", "medium", or "hard"

Respond ONLY in valid JSON format. No markdown, no explanation."""


# ─── api call functions ───

async def call_claude(prompt):
    """call anthropic claude api"""
    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.post(
            "https://api.anthropic.com/v1/messages",
            headers={
                "x-api-key": CLAUDE_API_KEY,
                "anthropic-version": "2023-06-01",
                "content-type": "application/json"
            },
            json={
                "model": CLAUDE_MODEL,
                "max_tokens": 2048,
                "messages": [{"role": "user", "content": prompt}]
            }
        )
        data = response.json()
        if response.status_code != 200:
            error_detail = data.get("error") or data
            raise ValueError(f"Claude API error {response.status_code}: {error_detail}")
        content = data.get("content")
        if not content or not isinstance(content, list) or len(content) == 0:
            raise ValueError(f"Claude API response missing content: {data}")
        text = content[0].get("text") if isinstance(content[0], dict) else None
        if text is None:
            raise ValueError(f"Claude API response missing text: {data}")
        return text


async def call_gemini(prompt):
    """call google gemini api"""
    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.post(
            f"https://generativelanguage.googleapis.com/v1beta/models/{GEMINI_MODEL}:generateContent?key={GEMINI_API_KEY}",
            headers={"content-type": "application/json"},
            json={
                "contents": [{"parts": [{"text": prompt}]}],
                "generationConfig": {
                    "temperature": 0.7,
                    "maxOutputTokens": 2048
                }
            }
        )
        data = response.json()
        if response.status_code != 200:
            error_detail = data.get("error") or data
            raise ValueError(f"Gemini API error {response.status_code}: {error_detail}")

        candidates = data.get("candidates")
        if not candidates or not isinstance(candidates, list):
            raise ValueError(f"Gemini API response missing candidates: {data}")

        text = candidates[0].get("content", {}).get("parts", [{}])[0].get("text", "")
        return text


async def call_openrouter(prompt):
    """call OpenRouter chat completions API"""
    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.post(
            OPENROUTER_URL,
            headers={
                "Authorization": f"Bearer {OPENROUTER_API_KEY}",
                "Content-Type": "application/json"
            },
            json={
                "model": OPENROUTER_MODEL,
                "messages": [{"role": "user", "content": prompt}],
                "temperature": 0.7,
                "max_tokens": 2048
            }
        )
        data = response.json()
        if response.status_code != 200:
            error_detail = data.get("error") or response.text
            raise ValueError(f"OpenRouter API error {response.status_code}: {error_detail}")

        choices = data.get("choices")
        if not choices or not isinstance(choices, list):
            raise ValueError(f"OpenRouter API response missing choices: {data}")

        choice = choices[0]
        message = choice.get("message")
        if isinstance(message, dict):
            text = message.get("content") or message.get("text")
        else:
            text = message
        if not isinstance(text, str):
            raise ValueError(f"OpenRouter API response missing content: {data}")
        return text


async def call_ai(prompt):
    """route to the configured ai provider"""
    if AI_PROVIDER == "claude":
        raw = await call_claude(prompt)
    elif AI_PROVIDER == "openrouter":
        raw = await call_openrouter(prompt)
    else:
        raw = await call_gemini(prompt)

    # clean up response - remove markdown code fences if present
    cleaned = raw.strip()
    if cleaned.startswith("```json"):
        cleaned = cleaned[7:]
    if cleaned.startswith("```"):
        cleaned = cleaned[3:]
    if cleaned.endswith("```"):
        cleaned = cleaned[:-3]
    return cleaned.strip()


# ─── feature functions ───

async def enhance_text(text, tone="academic"):
    prompt = ENHANCE_PROMPT.format(text=text, tone=tone)
    result = await call_ai(prompt)
    return json.loads(result)


async def explore_word(word):
    prompt = EXPLORE_PROMPT.format(word=word)
    result = await call_ai(prompt)
    return json.loads(result)


async def generate_quiz(count=5, difficulty="medium", quiz_type="mixed", words=None):
    word_context = ""
    if words and len(words) > 0:
        word_context = f"Focus questions on these words from the user's word bank: {', '.join(words)}"
    else:
        word_context = "Use interesting English vocabulary words suitable for students."

    prompt = QUIZ_PROMPT.format(
        count=count, difficulty=difficulty,
        quiz_type=quiz_type, word_context=word_context
    )
    result = await call_ai(prompt)
    return json.loads(result)


async def rewrite_text(text, tone="formal"):
    prompt = REWRITE_PROMPT.format(text=text, tone=tone)
    result = await call_ai(prompt)
    return json.loads(result)


async def get_word_of_day():
    result = await call_ai(WORD_OF_DAY_PROMPT)
    return json.loads(result)
