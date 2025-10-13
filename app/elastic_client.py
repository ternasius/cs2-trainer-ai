from elasticsearch import AsyncElasticsearch
import os
from dotenv import load_dotenv

load_dotenv()

# Connect to Elastic Serverless project
es = AsyncElasticsearch(
    os.getenv("ELASTIC_URL"),
    api_key=os.getenv("ELASTIC_API_KEY")
)

async def index_player_data(steam_id, analysis, recommendations):
    try:
        doc = {
            "steam_id": steam_id,
            "analysis": analysis,
            "recommendations": recommendations,
        }
        await es.index(index="player_training_data", id=steam_id, document=doc)
    except Exception as e:
        raise Exception(f"Elasticsearch indexing failed: {e}")