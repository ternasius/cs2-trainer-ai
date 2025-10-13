import os
import requests
import httpx
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("LEETIFY_API_KEY")

BASE_URL = "https://api-public.cs-prod.leetify.com"
HEADERS = {
    "Accept": "application/json",
    "_leetify_key": API_KEY
    }

async def get_player_data(steam_id: str):
    """Asynchronously fetch player profile information and match history using Leetify's v3 API."""
    async with httpx.AsyncClient() as client:
        url_profile = f"{BASE_URL}/v3/profile?steam64_id={steam_id}"
        url_matches = f"{BASE_URL}/v3/profile/matches?steam64_id={steam_id}"
        profile = (await client.get(url_profile, headers=HEADERS)).json()
        matches = (await client.get(url_matches, headers=HEADERS)).json()
        return profile, matches

def get_player_profile(steam_id: str):
    """Fetch player profile information using Leetify's v3 API."""
    url_player = f"{BASE_URL}/v3/profile?steam64_id={steam_id}"

    response = requests.get(url_player, headers=HEADERS, timeout=10)
    if response.status_code == 200:
        return response.json()
    else:
        raise Exception(f"Leetify API Error {response.status_code}: {response.text}")

def get_player_matches(steam_id: str):
    """Fetch recent matches for a player using Leetify's v3 API."""
    url_matches = f"{BASE_URL}/v3/profile/matches?steam64_id={steam_id}"

    response = requests.get(url_matches, headers=HEADERS, timeout=10)
    if response.status_code == 200:
        return response.json()
    else:
        raise Exception(f"Leetify API Error {response.status_code}: {response.text}")
    