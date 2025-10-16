from app.elastic_client import es
import asyncio

async def load_leetify_thresholds():
    """Load Leetify tier thresholds from Elasticsearch"""
    try:
        response = await es.search(index="leetify-references", body={"query": {"match_all": {}}})
        thresholds = {}
        for hit in response['hits']['hits']:
            data = hit['_source']
            thresholds[data['Tier'].lower()] = (data['Lower Bound'], data['Upper Bound'])
        return thresholds
    except Exception as e:
        print(f"Error loading Leetify thresholds: {e}")
        return {}

async def load_reference_tables():
    """Load reference tables from Elasticsearch indexes"""
    try:
        # Load leetify tiers
        leetify_response = await es.search(index="leetify-references", body={"query": {"match_all": {}}})
        leetify_tiers = {}
        for hit in leetify_response['hits']['hits']:
            data = hit['_source']
            leetify_tiers[data['Tier']] = (data['Lower Bound'], data['Upper Bound'])
        
        # Load premier references
        premier_response = await es.search(index="premier-references", body={"query": {"match_all": {}}})
        premier_reference = {}
        for hit in premier_response['hits']['hits']:
            data = hit['_source']
            key = (data['Lower Bound'], data['Upper Bound'])
            premier_reference[key] = {
                'Aim': data['Aim'],
                'Positioning': data['Positioning'],
                'Utility': data['Utility'],
                'accuracy_enemy_spotted': data['accuracy_enemy_spotted'],
                'accuracy_head': data['accuracy_head'],
                'counter_strafing_good_shots_ratio': data['counter_strafing_good_shots_ratio'],
                'flashbang_hit_foe_avg_duration': data['flashbang_hit_foe_avg_duration'],
                'flashbang_hit_foe_per_flashbang': data['flashbang_hit_foe_per_flashbang'],
                'flashbang_hit_friend_per_flashbang': data['flashbang_hit_friend_per_flashbang'],
                'flashbang_leading_to_kill': data['flashbang_leading_to_kill'],
                'he_foes_damage_avg': data['he_foes_damage_avg'],
                'he_friends_damage_avg': data['he_friends_damage_avg'],
                'preaim': data['preaim'],
                'reaction_time_ms': data['reaction_time_ms'],
                'spray_accuracy': data['spray_accuracy'],
                'utility_on_death_avg': data['utility_on_death_avg']
            }

        # Load faceit references
        faceit_response = await es.search(index="faceit-references", body={"query": {"match_all": {}}})
        faceit_reference = {}
        for hit in faceit_response['hits']['hits']:
            data = hit['_source']
            key = (data['Lower Bound'], data['Upper Bound'])
            faceit_reference[key] = {
                'Aim': data['Aim'],
                'Positioning': data['Positioning'],
                'Utility': data['Utility'],
                'accuracy_enemy_spotted': data['accuracy_enemy_spotted'],
                'accuracy_head': data['accuracy_head'],
                'counter_strafing_good_shots_ratio': data['counter_strafing_good_shots_ratio'],
                'flashbang_hit_foe_avg_duration': data['flashbang_hit_foe_avg_duration'],
                'flashbang_hit_foe_per_flashbang': data['flashbang_hit_foe_per_flashbang'],
                'flashbang_hit_friend_per_flashbang': data['flashbang_hit_friend_per_flashbang'],
                'flashbang_leading_to_kill': data['flashbang_leading_to_kill'],
                'he_foes_damage_avg': data['he_foes_damage_avg'],
                'he_friends_damage_avg': data['he_friends_damage_avg'],
                'preaim': data['preaim'],
                'reaction_time_ms': data['reaction_time_ms'],
                'spray_accuracy': data['spray_accuracy'],
                'utility_on_death_avg': data['utility_on_death_avg']
            }

        return premier_reference, faceit_reference, leetify_tiers

    except Exception as e:
        print(f"Error loading reference tables from Elasticsearch: {e}")