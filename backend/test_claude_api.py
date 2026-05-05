import sys
sys.path.insert(0, 'c:/Users/Dell/Downloads/vocab-enhancer/vocab-enhancer/backend')
from config import CLAUDE_API_KEY, CLAUDE_MODEL
import httpx

print(f'CLAUDE_API_KEY: {CLAUDE_API_KEY[:20]}...')
print(f'CLAUDE_MODEL: {CLAUDE_MODEL}')

async def main():
    async with httpx.AsyncClient(timeout=20.0) as client:
        response = await client.post(
            'https://api.anthropic.com/v1/messages',
            headers={
                'x-api-key': CLAUDE_API_KEY,
                'anthropic-version': '2023-06-01',
                'content-type': 'application/json'
            },
            json={
                'model': CLAUDE_MODEL,
                'max_tokens': 512,
                'messages': [{'role': 'user', 'content': 'Hello, please say yes.'}]
            }
        )
        print('Status:', response.status_code)
        try:
            print('Body:', response.json())
        except Exception as e:
            print('Body parse error:', e)
            print(response.text)

import asyncio
asyncio.run(main())
