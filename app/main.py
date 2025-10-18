from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from app.leetify_client import get_player_profile, get_player_matches, get_player_data
from app.elastic_client import index_player_data
from app.vertex_client import generate_recommendations
from app.data_processing import analyze_player_data

app = FastAPI(
    title="CS2 Training Recommender",
    version="1.0",
    description="AI-driven CS2 training"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for now
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "CS2 Training Recommender API"}

@app.get("/health")
def health_check():
    return {"status": "ok", "message": "API is running"}

@app.get("/analyze/{steam_id}")
async def analyze_player(steam_id: str):
    try:
        player_profile, match_data = await get_player_data(steam_id)
        analysis = await analyze_player_data(player_profile, match_data, steam_id, save_json=False)
        ai_suggestions = await generate_recommendations(analysis)
        await index_player_data(steam_id, analysis, ai_suggestions)
        return {"analysis": analysis, "recommendations": ai_suggestions}
    except Exception as e:
        print(f"Error in analyze_player: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/player/{steam_id}/profile")
def fetch_profile(steam_id: str):
    """Fetch player profile stats (rank, rating, etc.)."""
    try:
        profile = get_player_profile(steam_id)
        return {"status": "success", "profile": profile}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/player/{steam_id}/matches")
def fetch_and_store_matches(steam_id: str):
    """Fetch full match history from Leetify, store it in Elastic, and return it."""
    try:
        matches = get_player_matches(steam_id)
        return {
            "status": "success",
            "matches_indexed": len(matches),
            "matches": matches  # return full JSON array like your example
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))