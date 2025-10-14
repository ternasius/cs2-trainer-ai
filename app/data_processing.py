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
    }

    faceit_elo = ranks.get("faceit_elo")
    premier = ranks.get("premier")

    reference = None
    if faceit_elo:
        reference = next(
            (v for (low, high), v in faceit_reference.items() if low <= faceit_elo <= high),
            None,
        )
    elif premier:
        reference = next(
            (v for (low, high), v in premier_reference.items() if low <= premier <= high),
            None,
        )

    if reference:
        # Calculate differences for all metrics
        analysis["aim_diff"] = rating["aim"] - reference["Aim"]
        analysis["positioning_diff"] = rating["positioning"] - reference["Positioning"]
        analysis["utility_diff"] = rating["utility"] - reference["Utility"]
        
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
                analysis[f"{metric}_diff"] = stats[metric] - reference[metric]
                print(f"{metric}: stats={stats[metric]}, reference={reference[metric]}, agg={analysis[f'{metric}_diff']}")
        
        # Add raw values for side-specific and situational metrics with tier evaluation
        
        def get_tier(value):
            for tier, (low, high) in leetify_tiers.items():
                if low <= value <= high:
                    return tier
            return "unknown"
        
        raw_metrics = ['clutch', 'opening', 'ct_leetify', 't_leetify']
        for metric in raw_metrics:
            if metric in rating:
                value = rating[metric]
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
