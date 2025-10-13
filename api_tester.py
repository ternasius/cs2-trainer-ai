import os
import json
import requests
from dotenv import load_dotenv

# === 1. Load API key from .env ===
load_dotenv()
API_KEY = os.getenv("LEETIFY_API_KEY")

if not API_KEY:
    raise ValueError("⚠️ Missing LEETIFY_API_KEY in your .env file!")

# === 2. Configuration ===
BASE_URL = "https://api-public.cs-prod.leetify.com"
STEAM_ID64 = "76561198360167822"  # Replace with your own ID if needed

VALIDATE_URL = f"{BASE_URL}/api-key/validate"
PROFILE_URL = f"{BASE_URL}/v3/profile?steam64_id={STEAM_ID64}"
MATCHES_URL = f"{BASE_URL}/v3/profile/matches?steam64_id={STEAM_ID64}"

HEADERS = {
    "Accept": "application/json",
    "_leetify_key": API_KEY
}

# === 3. Validate API key ===
def validate_key():
    r = requests.get(VALIDATE_URL, headers=HEADERS, timeout=10)
    if r.status_code == 200:
        print("✅ API key is valid.")
    elif r.status_code == 401:
        raise ValueError("❌ Invalid or missing API key.")
    else:
        raise RuntimeError(f"⚠️ Unexpected error: {r.status_code} - {r.text}")

# === 4. Fetch profile data ===
def fetch_profile():
    print(f"📡 Fetching profile data for SteamID64 {STEAM_ID64} ...")
    r = requests.get(PROFILE_URL, headers=HEADERS, timeout=15)
    if r.status_code != 200:
        print(f"❌ Error {r.status_code}: {r.text}")
        raise RuntimeError("Failed to fetch profile data.")
    data = r.json()
    with open("leetify_profile.json", "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    print("✅ Saved data to leetify_profile.json")
    return data

if __name__ == "__main__":
    validate_key()
    profile_data = fetch_profile()
    print(json.dumps(profile_data, indent=2))
