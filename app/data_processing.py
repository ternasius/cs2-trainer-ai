from app.reference_tables import premier_reference, faceit_reference

def analyze_player_data(profile, matches):
    rating = profile["rating"]
    ranks = profile["ranks"]

    analysis = {
        "aim_diff": None,
        "positioning_diff": None,
        "utility_diff": None,
        "focus": [],
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
        analysis["aim_diff"] = rating["aim"] - reference["aim"]
        analysis["positioning_diff"] = rating["positioning"] - reference["positioning"]
        analysis["utility_diff"] = rating["utility"] - reference["utility"]

        # Identify weak points
        for skill, diff in {
            "aim": analysis["aim_diff"],
            "positioning": analysis["positioning_diff"],
            "utility": analysis["utility_diff"],
        }.items():
            if diff < 0:
                analysis["focus"].append(skill)

    return analysis
