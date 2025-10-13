from google import genai
from google.genai import types
import os
from dotenv import load_dotenv

load_dotenv()

# If you are using Vertex AI (not just Gemini Developer API)
USE_VERTEX = True  # pass this to Client

client = genai.Client(api_key=os.getenv("GCP_API_KEY"))

async def generate_recommendations(analysis: dict):
    try:
        prompt = f"""
        Based on this player's performance data:
        {analysis}

        Suggest specific Counter-Strike 2 training drills or areas to improve.
        Keep it concise, realistic, and actionable.
        """

        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=[{"role": "user", "content": prompt}],
        )

        return response.text
    except Exception as e:
        raise Exception(f"AI recommendation generation failed: {e}")