import os
from openai import OpenAI
import json

def get_groq_client():
    api_key = os.getenv('GROQ_API_KEY')
    if not api_key:
        return None
    # Groq uses the exact same interface as OpenAI
    return OpenAI(
        api_key=api_key,
        base_url="https://api.groq.com/openai/v1"
    )

def call_openai_json(prompt, system_prompt="You are a helpful assistant that outputs only valid JSON.", model="llama-3.1-8b-instant"):
    client = get_groq_client()
    if not client:
        print("Error: GROQ_API_KEY not found")
        return None
    
    try:
        response = client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": prompt}
            ],
            response_format={
                'type': 'json_object'
            },
            temperature=0.5
        )
        content = response.choices[0].message.content
        return json.loads(content)
    except Exception as e:
        print(f"Groq API Error (JSON): {e}")
        return None

def call_openai_text(messages, system_prompt="You are a helpful career advisor."):
    client = get_groq_client()
    if not client:
        print("Error: GROQ_API_KEY not found")
        return None
    
    api_messages = [{"role": "system", "content": system_prompt}]
    for m in messages:
        if m.get('role') in ['user', 'assistant']:
            api_messages.append({"role": m['role'], "content": m['content']})
            
    try:
        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=api_messages,
            temperature=0.7
        )
        return response.choices[0].message.content
    except Exception as e:
        print(f"Groq API Error (Text): {e}")
        return None
