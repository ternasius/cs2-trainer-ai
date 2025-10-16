from app.elastic_reference_loader import load_reference_tables
import json
import os
import asyncio

async def analyze_player_data(profile, matches, steam_id=None, save_json=False):
    # Load reference tables from Elasticsearch
    premier_reference, faceit_reference, leetify_tiers = await load_reference_tables()
    rating = profile["rating"]
    ranks = profile["ranks"]
    stats = profile["stats"]

    analysis = {
        "aim_diff": None,
        "positioning_diff": None,
        "utility_diff": None,
        "reference_values": None,
        "reference_rank": None,
        "leetify_tiers": leetify_tiers,
        "metric_names": {
            "aim": "Aim",
            "positioning": "Positioning", 
            "utility": "Utility",
            "accuracy_head": "Headshot Accuracy",
            "accuracy_enemy_spotted": "Spotted Accuracy",
            "spray_accuracy": "Spray Accuracy",
            "counter_strafing_good_shots_ratio": "Counter-Strafing",
            "preaim": "Crosshair Placement",
            "reaction_time_ms": "Time to Damage",
            "flashbang_hit_foe_per_flashbang": "Flash Effectiveness",
            "he_foes_damage_avg": "Average HE Damage",
            "utility_on_death_avg": "Utility on Death",
            "ct_leetify": "CT Side Rating",
            "t_leetify": "T Side Rating",
            "clutch": "Clutch",
            "opening": "Opening Duels"
        }
    }

    faceit_elo = ranks.get("faceit_elo")
    faceit_level = ranks.get("faceit")
    premier = ranks.get("premier")

    reference = None
    reference_rank = None
    
    if faceit_elo:
        for (low, high), v in faceit_reference.items():
            if low <= faceit_elo <= high:
                reference = v
                reference_rank = f"Faceit Level {faceit_level}"
                break
    elif premier:
        for (low, high), v in premier_reference.items():
            if low <= premier <= high:
                reference = v
                reference_rank = f"Premier {low}-{high}"
                break
    else:
        # Fallback to 10000-14999 premier range if no rank available
        for (low, high), v in premier_reference.items():
            if low == 10000 and high == 14999:
                reference = v
                reference_rank = f"Premier: {low}-{high} (Default)"
                break

    if reference:
        # Store reference rank information
        analysis["reference_rank"] = reference_rank
        
        # Store reference values for frontend display
        analysis["reference_values"] = {
            "aim": reference["Aim"],
            "positioning": reference["Positioning"],
            "utility": reference["Utility"],
            "accuracy_head": reference["accuracy_head"],
            "accuracy_enemy_spotted": reference["accuracy_enemy_spotted"],
            "spray_accuracy": reference["spray_accuracy"],
            "counter_strafing_good_shots_ratio": reference["counter_strafing_good_shots_ratio"],
            "preaim": reference["preaim"],
            "reaction_time_ms": reference["reaction_time_ms"],
            "flashbang_hit_foe_per_flashbang": reference["flashbang_hit_foe_per_flashbang"],
            "he_foes_damage_avg": reference["he_foes_damage_avg"],
            "utility_on_death_avg": reference["utility_on_death_avg"]
        }
        
        # Calculate differences for all metrics
        analysis["aim_diff"] = round(rating["aim"] - reference["Aim"], 2)
        analysis["positioning_diff"] = round(rating["positioning"] - reference["Positioning"], 2)
        analysis["utility_diff"] = round(rating["utility"] - reference["Utility"], 2)
        
        # Calculate differences for detailed metrics if they exist in rating
        detailed_metrics = [
            'accuracy_enemy_spotted', 'accuracy_head', 'counter_strafing_good_shots_ratio',
            'flashbang_hit_foe_avg_duration', 'flashbang_hit_foe_per_flashbang', 
            'flashbang_hit_friend_per_flashbang', 'flashbang_leading_to_kill',
            'he_foes_damage_avg', 'he_friends_damage_avg', 'preaim', 
            'reaction_time_ms', 'spray_accuracy', 'utility_on_death_avg'
        ]
        
        for metric in detailed_metrics:
            if metric in stats and metric in reference:
                analysis[f"{metric}_diff"] = round(stats[metric] - reference[metric], 2)
        
        # Add raw values for side-specific and situational metrics with tier evaluation
        
        def get_tier(value):
            for tier, (low, high) in leetify_tiers.items():
                if low <= value <= high:
                    return tier
            return "unknown"
        
        raw_metrics = ['clutch', 'opening', 'ct_leetify', 't_leetify']
        for metric in raw_metrics:
            if metric in rating:
                value = round(rating[metric], 2)
                analysis[metric] = value
                analysis[f"{metric}_tier"] = get_tier(value)



    # Save analysis to JSON file if requested
    if save_json:
        try:
            filename = f"analysis_{steam_id or 'unknown'}.json"
            with open(filename, 'w') as f:
                json.dump(analysis, f, indent=2)
        except Exception as e:
            print(f"Warning: Could not save analysis to file: {e}")
    
    return analysis
