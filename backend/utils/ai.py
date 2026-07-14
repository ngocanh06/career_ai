import os
from openai import OpenAI
import json

def get_ai_client_and_model(requested_model=None):
    # Check GROQ_API_KEY
    groq_key = os.getenv('GROQ_API_KEY')
    if groq_key and groq_key.strip() and groq_key.strip() != 'your_groq_api_key':
        client = OpenAI(
            api_key=groq_key.strip(),
            base_url="https://api.groq.com/openai/v1"
        )
        model = requested_model if requested_model else "llama-3.1-8b-instant"
        return client, model, "Groq"

    # Check OPENAI_API_KEY
    openai_key = os.getenv('OPENAI_API_KEY')
    if openai_key and openai_key.strip() and openai_key.strip() != 'your_openai_api_key':
        client = OpenAI(api_key=openai_key.strip())
        model = "gpt-4o" if requested_model == "llama-3.3-70b-versatile" else "gpt-4o-mini"
        return client, model, "OpenAI"

    # Check GEMINI_API_KEY
    gemini_key = os.getenv('GEMINI_API_KEY')
    if gemini_key and gemini_key.strip() and gemini_key.strip() != 'your_gemini_api_key':
        client = OpenAI(
            api_key=gemini_key.strip(),
            base_url="https://generativelanguage.googleapis.com/v1beta/openai/"
        )
        model = "gemini-1.5-pro" if requested_model == "llama-3.3-70b-versatile" else "gemini-1.5-flash"
        return client, model, "Gemini"

    # Check DEEPSEEK_API_KEY
    deepseek_key = os.getenv('DEEPSEEK_API_KEY')
    if deepseek_key and deepseek_key.strip() and deepseek_key.strip() != 'your_deepseek_api_key':
        client = OpenAI(
            api_key=deepseek_key.strip(),
            base_url="https://api.deepseek.com"
        )
        model = "deepseek-chat"
        return client, model, "DeepSeek"

    print("Error: No valid API key found (GROQ_API_KEY, OPENAI_API_KEY, GEMINI_API_KEY, or DEEPSEEK_API_KEY)")
    return None, None, None

def call_openai_json(prompt, system_prompt="You are a helpful assistant that outputs only valid JSON.", model="llama-3.1-8b-instant"):
    client, mapped_model, provider = get_ai_client_and_model(model)
    if not client:
        return None
    
    try:
        response = client.chat.completions.create(
            model=mapped_model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": prompt}
            ],
            response_format={
                'type': 'json_object'
            },
            temperature=0.3
        )
        content = response.choices[0].message.content
        return json.loads(content)
    except Exception as e:
        print(f"{provider} API Error (JSON): {e}")
        return None

def call_openai_text(messages, system_prompt="You are a helpful career advisor."):
    client, mapped_model, provider = get_ai_client_and_model()
    if not client:
        return None
    
    api_messages = [{"role": "system", "content": system_prompt}]
    for m in messages:
        if m.get('role') in ['user', 'assistant']:
            api_messages.append({"role": m['role'], "content": m['content']})
            
    try:
        response = client.chat.completions.create(
            model=mapped_model,
            messages=api_messages,
            temperature=0.7
        )
        return response.choices[0].message.content
    except Exception as e:
        print(f"{provider} API Error (Text): {e}")
        return None
