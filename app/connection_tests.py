import os
from dotenv import load_dotenv
from elasticsearch import Elasticsearch
from google import genai

# Load environment variables
load_dotenv()

# --------------------------------------------------------------------
# 🔹 Check Elasticsearch Connection
# --------------------------------------------------------------------
def test_elasticsearch():
    print("🔹 Testing Elasticsearch connection...")

    es_url = os.getenv("ELASTIC_URL")
    es_api_key = os.getenv("ELASTIC_API_KEY")

    if not es_url or not es_api_key:
        print("❌ Elasticsearch environment variables missing (ELASTIC_URL or ELASTIC_API_KEY)")
        return

    try:
        es = Elasticsearch(es_url, api_key=es_api_key)
        info = es.info()
        print("✅ Connected to Elasticsearch!")
        print(f"Cluster Name: {info['cluster_name']}")
    except Exception as e:
        print("❌ Failed to connect to Elasticsearch")
        print(e)

# --------------------------------------------------------------------
# 🔹 Check Vertex AI (Gemini) Connection
# --------------------------------------------------------------------
def test_vertex_ai():
    print("\n🔹 Testing Vertex AI / Gemini connection...")

    os.environ["GOOGLE_CLOUD_PROJECT"] = os.getenv("GCP_PROJECT_ID")
    os.environ["GOOGLE_CLOUD_LOCATION"] = os.getenv("GCP_LOCATION")
    os.environ["GOOGLE_GENAI_USE_VERTEXAI"] = "True"
    os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")

    try:
        client = genai.Client()

        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents="Hello from Vertex AI! Please confirm connection."
        )

        print("✅ Vertex AI connection successful!")
        print("Response snippet:")
        print(response.text[:200])  # print first 200 chars

    except Exception as e:
        print("❌ Vertex AI connection failed")
        print(f"Error: {e}")

# --------------------------------------------------------------------
# 🔹 Run both tests
# --------------------------------------------------------------------
if __name__ == "__main__":
    test_elasticsearch()
    test_vertex_ai()
