import sys
sys.path.insert(0, 'c:/Users/Dell/Downloads/vocab-enhancer/vocab-enhancer/backend')
from config import GEMINI_API_KEY, GEMINI_MODEL
import httpx

print(f'GEMINI_API_KEY: {GEMINI_API_KEY[:20]}...')
print(f'GEMINI_MODEL: {GEMINI_MODEL}')

# Test Gemini API
response = httpx.post(
    f'https://generativelanguage.googleapis.com/v1beta/models/{GEMINI_MODEL}:generateContent?key={GEMINI_API_KEY}',
    json={
        'contents': [{'parts': [{'text': 'Say hello in one word'}]}],
        'generationConfig': {'temperature': 0.7, 'maxOutputTokens': 100}
    },
    timeout=10
)
print(f'Gemini API Status: {response.status_code}')
if response.status_code == 200:
    print('✓ Gemini API Key is WORKING')
    result = response.json()
    text = result['candidates'][0]['content']['parts'][0]['text']
    print(f'Response: {text[:100]}')
else:
    print(f'✗ Gemini API Error: {response.text[:200]}')
