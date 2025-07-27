#!/usr/bin/env python3
"""
Smart API Testing Script for Space Explorer Search Functionality

This script simulates multiple search requests to test the search and history endpoints.
You can easily adjust the number of searches by changing the NUM_SEARCHES variable.
"""

import requests
import json
import time
import random
from typing import List, Dict

# Configuration
BASE_URL = "http://localhost:5000"
NUM_SEARCHES = 10  # 🔧 Change this number to run more or fewer searches

# Sample search queries for NASA space images
SAMPLE_QUERIES = [
    "Mars rover images",
    "International Space Station",
    "Saturn rings",
    "Jupiter moons",
    "Solar flares",
    "Nebula photographs",
    "Earth from space",
    "Apollo mission",
    "Hubble telescope images",
    "Galaxy clusters",
    "Venus surface",
    "Moon craters",
    "Astronaut spacewalk",
    "Rocket launches",
    "Space shuttle",
    "Comet tail",
    "Asteroid belt",
    "Planetary alignment",
    "Solar eclipse",
    "Aurora borealis from space",
    "Martian landscape",
    "Space debris",
    "Exoplanet discovery",
    "Black hole simulation",
    "Milky Way center"
]


def make_search_request(query: str) -> Dict:
    """Make a search request to the API."""
    try:
        response = requests.post(
            f"{BASE_URL}/api/search",
            json={"query": query},
            headers={"Content-Type": "application/json"}
        )
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"❌ Error making search request for '{query}': {e}")
        return None


def get_search_history() -> List[Dict]:
    """Get the current search history."""
    try:
        response = requests.get(f"{BASE_URL}/api/history")
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"❌ Error getting search history: {e}")
        return []


def print_search_result(search_data: Dict, search_num: int):
    """Print a formatted search result."""
    if not search_data:
        return
    
    print(f"\n🔍 Search #{search_num}")
    print(f"   Query: '{search_data['query']}'")
    print(f"   Results: {search_data['resultCount']} images found")
    print(f"   Timestamp: {search_data['timestamp']}")
    
    if search_data.get('confidence_scores'):
        avg_confidence = sum(search_data['confidence_scores'].values()) / len(search_data['confidence_scores'])
        print(f"   Avg Confidence: {avg_confidence:.1f}%")


def print_history_summary(history: List[Dict]):
    """Print a comprehensive summary of search history."""
    if not history:
        print("\n📋 No search history found.")
        return
    
    print(f"\n📋 SEARCH HISTORY SUMMARY")
    print(f"{'='*60}")
    print(f"Total searches: {len(history)}")
    
    # Calculate some statistics
    total_results = sum(item['resultCount'] for item in history)
    avg_results = total_results / len(history) if history else 0
    
    print(f"Total images found across all searches: {total_results}")
    print(f"Average results per search: {avg_results:.1f}")
    
    # Show all searches
    print(f"\n📝 DETAILED HISTORY:")
    print(f"{'-'*60}")
    
    for i, item in enumerate(history, 1):
        # Convert timestamp to readable format
        timestamp_readable = time.strftime('%Y-%m-%d %H:%M:%S', time.localtime(item['timestamp']/1000))
        
        print(f"{i:2d}. Query: '{item['query']}'")
        print(f"    ID: {item['id'][:8]}...")
        print(f"    Time: {timestamp_readable}")
        print(f"    Results: {item['resultCount']} images")
        
        if item.get('confidence_scores'):
            avg_conf = sum(item['confidence_scores'].values()) / len(item['confidence_scores'])
            max_conf = max(item['confidence_scores'].values())
            print(f"    Confidence: avg={avg_conf:.1f}%, max={max_conf:.1f}%")
        
        print()


def test_api_connection():
    """Test if the API server is running."""
    try:
        response = requests.get(f"{BASE_URL}/api/sources", timeout=5)
        response.raise_for_status()
        sources = response.json()
        print(f"✅ API server is running - found {len(sources)} NASA sources")
        return True
    except requests.exceptions.RequestException as e:
        print(f"❌ Cannot connect to API server at {BASE_URL}")
        print(f"   Error: {e}")
        print(f"   Make sure the server is running with: py -m uvicorn app:app --reload --port 5000")
        return False


def main():
    """Main function to run the search simulation."""
    print("🚀 Space Explorer API Testing Script")
    print(f"🎯 Simulating {NUM_SEARCHES} search requests...")
    print(f"🌐 API Server: {BASE_URL}")
    
    # Test API connection first
    if not test_api_connection():
        return
    
    print(f"\n🔄 Starting {NUM_SEARCHES} search simulations...")
    
    # Perform searches
    successful_searches = 0
    for i in range(1, NUM_SEARCHES + 1):
        # Pick a random query from our samples
        query = random.choice(SAMPLE_QUERIES)
        
        print(f"\n⏳ Search {i}/{NUM_SEARCHES}: '{query}'", end="... ")
        
        # Make the search request
        search_result = make_search_request(query)
        
        if search_result:
            print("✅ Success")
            print_search_result(search_result, i)
            successful_searches += 1
        else:
            print("❌ Failed")
        
        # Small delay between requests to be nice to the server
        time.sleep(0.5)
    
    print(f"\n🎉 Completed {successful_searches}/{NUM_SEARCHES} searches successfully!")
    
    # Get and display the search history
    print(f"\n📥 Retrieving search history...")
    history = get_search_history()
    print_history_summary(history)
    
    print(f"\n✨ Test completed! You can modify NUM_SEARCHES at the top of this script to run more tests.")


if __name__ == "__main__":
    main()
