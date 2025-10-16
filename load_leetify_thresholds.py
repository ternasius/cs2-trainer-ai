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

if __name__ == "__main__":
    thresholds = asyncio.run(load_leetify_thresholds())
    print(thresholds)