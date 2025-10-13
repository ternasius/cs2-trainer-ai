from google import genai
from google.genai import types
import os
from dotenv import load_dotenv

load_dotenv()

os.environ["GOOGLE_CLOUD_PROJECT"] = os.getenv("GCP_PROJECT_ID")
os.environ["GOOGLE_CLOUD_LOCATION"] = os.getenv("GCP_LOCATION")
os.environ["GOOGLE_GENAI_USE_VERTEXAI"] = "True"
os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")

client = genai.Client()

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
            contents=prompt,
        )

        return response.text
    except Exception as e:
        raise Exception(f"AI recommendation generation failed: {e}")