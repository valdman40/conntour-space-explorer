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
NUM_SEARCHES = 10000  # 🔧 Change this number to run more or fewer searches

# Sample search queries for NASA space images
SAMPLE_QUERIES = [
    # Short searches
    "Mars",
    "ISS", 
    "Sun",
    "Moon",
    "Earth",
    "Saturn",
    "Jupiter",
    "Venus",
    "Pluto",
    "Uranus",
    "Neptune",
    "Comets",
    "Galaxies",
    "Stars",
    "Nebula",
    "Aliens",
    "UFO",
    "Rockets",
    "Meteors",
    "Aurora",
    
    # Medium length searches
    "Mars rover images",
    "International Space Station",
    "Saturn rings close up",
    "Jupiter moons Europa",
    "Solar flares activity",
    "Nebula photographs colorful",
    "Earth from space blue",
    "Apollo moon mission",
    "Hubble telescope deep space",
    "Galaxy clusters formation",
    "Venus surface volcanic",
    "Moon craters detailed",
    "Astronaut spacewalk EVA",
    "Rocket launches SpaceX",
    "Space shuttle Discovery",
    "Comet tail bright",
    "Asteroid belt mining",
    "Planetary alignment rare",
    "Solar eclipse corona",
    "Aurora borealis space view",
    "Martian landscape red",
    "Space debris problem",
    "Exoplanet discovery Kepler",
    "Black hole event horizon",
    "Milky Way galactic center",
    "Cosmic microwave background",
    "Dark matter visualization",
    "Neutron star collision",
    "Pulsar lighthouse effect",
    "Supernova explosion remnant",
    
    # Bizarre and creative searches
    "Alien disco party on Mars",
    "Space cats floating weightless",
    "Cosmic pizza delivery service",
    "Interstellar coffee shop nebula",
    "Dancing robots on Jupiter moons",
    "Galactic unicorns rainbow trails",
    "Space pirate treasure asteroid",
    "Cosmic spaghetti black hole",
    "Alien vacation photos Earth",
    "Intergalactic sports tournament",
    "Space fashion show runway",
    "Cosmic DJ mixing planets",
    "Alien pet show competition",
    "Space circus acrobats zero-g",
    "Galactic food truck festival",
    "Cosmic karaoke night stars",
    "Space surfing solar winds",
    "Alien comedy club laughs",
    "Intergalactic dating app",
    "Cosmic art gallery exhibition",
    "Space yoga meditation poses",
    "Alien rock concert amplifiers",
    "Galactic chess tournament",
    "Cosmic cooking show recipes",
    "Space detective mystery case",
    "Alien school graduation ceremony",
    "Interstellar taxi service",
    "Cosmic dance battle competition",
    "Space library floating books",
    "Alien technology expo showcase",
    
    # Long detailed searches
    "Detailed analysis of the atmospheric composition and weather patterns observed on Mars during the spring season in the northern hemisphere",
    "Comprehensive study of the gravitational effects and tidal forces exerted by Jupiter's largest moons on the planet's magnetosphere and radiation belts",
    "High resolution images and spectroscopic data from the Hubble Space Telescope showing the birth and death of massive stars in distant galaxy clusters",
    "Investigation into the potential for microbial life in the subsurface oceans of Europa and Enceladus using advanced drilling and sampling techniques",
    "Comparative analysis of solar wind interactions with planetary magnetospheres across different types of celestial bodies in our solar system",
    "Long-term monitoring and documentation of coronal mass ejections and their impact on Earth's technological infrastructure and satellite communications",
    "Detailed mapping and geological survey of the lunar south pole region for potential water ice deposits and future human settlement possibilities",
    "Comprehensive catalog of near-Earth asteroids and their orbital trajectories for planetary defense and potential mining operations in the coming decades",
    "Advanced radio telescope observations searching for artificial signals and technosignatures from potentially habitable exoplanets within 100 light years",
    "Multi-wavelength astronomical survey combining visible light, infrared, x-ray and gamma ray observations of active galactic nuclei and supermassive black holes",
    
    # Weird technical searches
    "Quantum entanglement experiments zero gravity",
    "Reverse engineered alien technology blueprints",
    "Time dilation effects near black holes",
    "Wormhole navigation charts galactic travel",
    "Antimatter propulsion system designs",
    "Dimensional portal opening procedures",
    "Terraforming equipment atmospheric processors",
    "Cryogenic hibernation pods space travel",
    "Artificial gravity generators spinning habitats",
    "Force field technology asteroid deflection",
    "Holographic star maps 3D navigation",
    "Plasma shield defensive systems",
    "Tractor beam technology specifications",
    "Hyperdrive engine schematics blueprints",
    "Teleportation device quantum mechanics",
    
    # Pop culture and funny searches
    "Death Star construction manual",
    "Millennium Falcon repair guide",
    "Enterprise warp core maintenance",
    "Tardis police box blueprints",
    "Jedi lightsaber crystal mining",
    "Klingon battle cruiser weapons",
    "Vulcan logic meditation techniques",
    "Dalek extermination protocols",
    "Cyberman upgrade procedures manual",
    "Stargate address directory",
    "Babylon 5 station operations",
    "Battlestar Galactica jump coordinates",
    "Firefly class transport specifications",
    "Serenity engine room layout",
    "X-wing fighter pilot manual",
    
    # Scientific but weird searches
    "Purple space whales migration patterns",
    "Crystalline entities living asteroids",
    "Sentient gas clouds Jupiter atmosphere",
    "Energy beings electromagnetic signatures",
    "Silicon-based lifeforms volcanic planets",
    "Photosynthetic space plants solar radiation",
    "Magnetic field anomalies consciousness",
    "Temporal paradox prevention protocols",
    "Parallel universe communication methods",
    "Gravity wave surfing techniques"
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
