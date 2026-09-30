import os
import json

from dotenv import load_dotenv
from groq import Groq

from models.review_response import ReviewResponse
from models.fix_response import FixResponse


load_dotenv()


class LLMService:

    def __init__(self):
        api_key = os.getenv("GROQ_API_KEY")

        if not api_key:
            raise RuntimeError("GROQ_API_KEY is not set")

        self.client = Groq(api_key=api_key)

    def test_connection(self):
        response = self.client.chat.completions.create(
            model="openai/gpt-oss-20b",
            messages=[
                {
                    "role": "user",
                    "content": "Reply with exactly: AetherReview LLM connected"
                }
            ]
        )

        return response.choices[0].message.content

    def review_code(self, filename, code):

        prompt = f"""
You are AetherReview, an AI code review engine.

Analyze the following source code.

Filename:
{filename}

Code:
{code}

Identify:

1. Security vulnerabilities
2. Critical bugs
3. Serious code anti-patterns
4. Performance problems

Return ONLY valid JSON using exactly this structure:

{{
    "issues": [
        {{
            "type": "string",
            "message": "string",
            "line": 0,
            "severity": "LOW | MEDIUM | HIGH | CRITICAL",
            "suggestion": "string"
        }}
    ],
    "summary": "string"
}}

Rules:

- If there are no issues, return an empty issues array.
- line must be the line number where the issue occurs.
- If the exact line cannot be determined, use 0.
- Do not include fixed code.
- Do not include Markdown.
- Do not include ```json.
- Return ONLY the JSON object.
"""

        response = self.client.chat.completions.create(
            model="openai/gpt-oss-20b",
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are a precise code review engine. "
                        "Return only valid JSON."
                    )
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            response_format={"type": "json_object"}
        )

        raw_response = response.choices[0].message.content

        print("RAW LLM RESPONSE:")
        print(raw_response)

        data = json.loads(raw_response)

        data["filename"] = filename

        return ReviewResponse.model_validate(data)

    def fix_code(self, filename, code, issues):

        prompt = f"""
You are AetherReview, an AI code fixing engine.

Fix the following source code based ONLY on the identified issues.

Filename:
{filename}

Original Code:
{code}

Identified Issues:
{json.dumps(issues, indent=2)}

Return ONLY valid JSON using exactly this structure:

{{
    "fixedCode": "complete corrected source code",
    "summary": "short summary of the changes"
}}

Rules:

- Return the COMPLETE corrected source code.
- Preserve the original programming language.
- Fix the identified issues.
- Do not introduce unnecessary changes.
- Do not include Markdown.
- Do not include ```java or ```python.
- Return ONLY the JSON object.
"""

        response = self.client.chat.completions.create(
            model="openai/gpt-oss-20b",
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are a precise code fixing engine. "
                        "Return only valid JSON."
                    )
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            response_format={"type": "json_object"}
        )

        raw_response = response.choices[0].message.content

        print("RAW FIX RESPONSE:")
        print(raw_response)

        data = json.loads(raw_response)

        data["filename"] = filename

        return FixResponse.model_validate(data)