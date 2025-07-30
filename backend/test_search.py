from data.db import SpaceDB

# Test the search functionality and history saving
db = SpaceDB()

# Clear existing history for clean test
db._search_history = []

# Test search for "ksc"
print("=== Testing Search and History ===")
results1, scores1, has_more1, total1 = db.search_sources('ksc', 1, 20)
print(f"Total matching results: {total1}")
print(f"Page 1 results: {len(results1)}")
print(f"Has more pages: {has_more1}")

# Add to history (simulating what the API does)
history_id = db.add_search_history_item(
    query='ksc',
    results=results1,  # First page results
    confidence_scores=scores1,
    total_count=total1  # Total count of all matches
)

print(f"\nHistory item created with ID: {history_id}")

# Check the history
history = db.get_search_history()
if history:
    latest_item = history[0]
    print(f"Latest history item:")
    print(f"  Query: {latest_item['query']}")
    print(f"  Result Count: {latest_item['resultCount']}")
    print(f"  Actual results saved: {len(latest_item['results'])}")
    print(f"  Should show {total1} total matches, not just {len(results1)} from first page")
else:
    print("No history items found")
