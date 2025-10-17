from google import genai
from google.genai import types
import os
from dotenv import load_dotenv

load_dotenv()

os.environ["GOOGLE_CLOUD_PROJECT"] = os.getenv("GCP_PROJECT_ID")
os.environ["GOOGLE_CLOUD_LOCATION"] = os.getenv("GCP_LOCATION")
os.environ["GOOGLE_GENAI_USE_VERTEXAI"] = "True"
os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = os.getenv("GOOGLE_APPLICATION_CREDENTIALS", "/tmp/gcp-key.json")

client = genai.Client()

async def generate_recommendations(analysis: dict):
    try:
        # Get metric names for readable output
        metric_names = analysis.get('metric_names', {})
        
        prompt = f"""
        You are a Counter-Strike 2 coach analyzing player performance data. Here's what each metric means:

        IMPORTANT: Ignore the "leetify_tiers" field in the data - this is for frontend display only and should not be included in your analysis.

        METRIC NAME CONVERSIONS (use these readable names in your response instead of the keys):
        {metric_names}

        PERFORMANCE METRICS (all *_diff values show difference from rank average - negative = below average):
        - aim_diff: Difference from rank average aim rating
        - positioning_diff: Difference from rank average positioning rating  
        - utility_diff: Difference from rank average utility usage
        - accuracy_enemy_spotted_diff: Difference in accuracy when enemy spotted on radar (%)
        - accuracy_head_diff: Difference in headshot accuracy (%)
        - counter_strafing_good_shots_ratio_diff: Difference in % of shots with proper counter-strafing
        - flashbang_hit_foe_avg_duration_diff: Difference in average blind duration on enemies (seconds)
        - flashbang_hit_foe_per_flashbang_diff: Difference in enemies blinded per flashbang
        - flashbang_hit_friend_per_flashbang_diff: Difference in teammates accidentally blinded (lower is better)
        - flashbang_leading_to_kill_diff: Difference in % of flashbangs leading to kills
        - he_foes_damage_avg_diff: Difference in average HE grenade damage to enemies
        - he_friends_damage_avg_diff: Difference in HE damage to teammates (lower is better)
        - preaim_diff: Difference in degrees of time crosshair pre-positioned at angles
        - reaction_time_ms_diff: Difference in reaction time (negative = faster, positive = slower)
        - spray_accuracy_diff: Difference in spray control accuracy (%)
        - utility_on_death_avg_diff: Difference in utility value held when dying (negative = better)
        - clutch: Raw clutch situation performance rating (zero-sum: 0=average, positive=above average, negative=below average)
        - clutch_tier: Performance tier (poor/subpar/average/good/great)
        - opening: Raw opening duel performance rating (zero-sum: 0=average, positive=above average, negative=below average)
        - opening_tier: Performance tier (poor/subpar/average/good/great)
        - ct_leetify: Raw Counter-Terrorist side performance rating (zero-sum: 0=average, positive=above average, negative=below average)
        - ct_leetify_tier: Performance tier (poor/subpar/average/good/great)
        - t_leetify: Raw Terrorist side performance rating (zero-sum: 0=average, positive=above average, negative=below average)
        - t_leetify_tier: Performance tier (poor/subpar/average/good/great)

        Please note the following when reading through the metrics:
        - reaction_time_ms and utility_on_death_avg are large numbers, so the magnitude of their diff metrics should have less weight
        - flashbang_hit_foe_avg_duration, flashbang_hit_foe_per_flashbang, flashbang_hit_friend_per_flashbang, flashbang_leading_to_kill, he_foes_damage_avg, he_friends_damage_avg, and preaim are small numbers, so the magnitude of their diff metrics should have more weight
        - flashbang_hit_friend_per_flashbang, he_friends_damage_avg, preaim, reactin_time_ms, and utility_on_death_avg are all metrics that indicate above average performance if the diff is negative, since the numbers for these metrics decrease as skill increases

        IMPORTANT: When mentioning metrics in your response, use the readable names from the conversion table above, not the technical keys. Wrap metric names in brackets like [Aim] or [Headshot Accuracy] to make them stand out.

        PLAYER DATA:
        {analysis}

        Based on this data, provide:
        1. An overall performance score out of 100 compared to their rank average (consider all metrics, with more weight on core skills like aim, positioning, utility)
        2. 3-4 specific, actionable training recommendations. Focus on the biggest weaknesses first. Include specific workshop maps, aim trainers, or practice routines where relevant.
        
        Format your response as:
        **Overall Score: X/100**
        
        [Your recommendations here]
        
        You should also refer to the player directly, as if you're talking to the player.
        """

        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=prompt,
        )

        return response.text
    except Exception as e:
        raise Exception(f"AI recommendation generation failed: {e}")