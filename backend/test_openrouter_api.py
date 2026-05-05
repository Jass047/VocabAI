import os
import httpx

OPENROUTER_API_KEY = os.getenv('OPENROUTER_API_KEY')
OPENROUTER_MODEL = os.getenv('OPENROUTER_MODEL', 'openai/gpt-4o-mini')
OPENROUTER_URL = os.getenv('OPENROUTER_URL', 'https://openrouter.ai/api/v1/chat/completions')

if not OPENROUTER_API_KEY:
    raise SystemExit('OPENROUTER_API_KEY environment variable is required for this test.')

async def main():
    async with httpx.AsyncClient(timeout=20.0) as client:
        response = await client.post(
            OPENROUTER_URL,
            headers={
                'Authorization': f'Bearer {OPENROUTER_API_KEY}',
                'Content-Type': 'application/json'
            },
            json={
                'model': OPENROUTER_MODEL,
                'messages': [{'role': 'user', 'content': 'Hello from OpenRouter. Please reply with one word: Success.'}],
                'temperature': 0.7,
                'max_tokens': 100
            }
        )
        print('Status:', response.status_code)
        try:
            print(response.json())
        except Exception:
            print('Response text:', response.text)
            raise

import asyncio
asyncio.run(main())
