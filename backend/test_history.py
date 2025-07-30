from data.db import SpaceDB

# Test the search functionality and history
db = SpaceDB()

print("=== Testing search functionality ===")
# Test direct search
results1, scores1, has_more1, total1 = db.search_sources('ksc', 1, 20)
print(f"Direct search - Total: {total1}, Page 1: {len(results1)}, Has more: {has_more1}")

# Test full results for history
all_results, all_scores, _, total_all = db.search_sources('ksc', 1, total1)
print(f"All results for history - Total: {total_all}, All results: {len(all_results)}")

print("\n=== Testing history saving ===")
# Test adding to history with all results
search_id = db.add_search_history_item(
    query='test_history_all_results',
    results=all_results,
    confidence_scores=all_scores,
    total_count=total_all
)

# Check if history was saved correctly
history = db.get_search_history()
if history:
    latest = history[0]  # Most recent search
    print(f"History saved - Query: {latest['query']}")
    print(f"  Total count: {latest['resultCount']}")
    print(f"  Saved results: {len(latest['results'])}")
    print(f"  Should be equal: {latest['resultCount'] == len(latest['results'])}")
else:
    print("No history found")
