import json
import os
import time
import uuid
from typing import Dict, List


class SpaceDB:
    def __init__(self):
        # Load and parse the JSON data
        data_path = os.path.join(os.path.dirname(__file__), "mock_data.json")
        with open(data_path, "r", encoding="utf-8") as f:
            json_data = json.load(f)
        # Flatten and map the data to the expected format
        self._sources = []
        items = json_data.get("collection", {}).get("items", [])
        for idx, item in enumerate(items, start=1):
            data = item.get("data", [{}])[0]
            links = item.get("links", [])
            image_url = None
            for link in links:
                if link.get("render") == "image":
                    image_url = link.get("href")
                    break
            self._sources.append(
                {
                    "id": idx,
                    "name": data.get("title", f"NASA Item {idx}"),
                    "type": data.get("media_type", "unknown"),
                    "launch_date": data.get("date_created", ""),
                    "description": data.get("description", ""),
                    "image_url": image_url,
                    "status": "Active",
                }
            )
        self._next_id = len(self._sources) + 1
        
        # Initialize search history storage with JSON file persistence
        self._history_file_path = os.path.join(os.path.dirname(__file__), "search_history.json")
        self._search_history: List[Dict] = self._load_search_history()

    def _load_search_history(self) -> List[Dict]:
        """Load search history from JSON file."""
        try:
            if os.path.exists(self._history_file_path):
                with open(self._history_file_path, "r", encoding="utf-8") as f:
                    return json.load(f)
            return []
        except (json.JSONDecodeError, IOError) as e:
            print(f"Warning: Could not load search history: {e}")
            return []

    def _save_search_history(self):
        """Save search history to JSON file."""
        try:
            with open(self._history_file_path, "w", encoding="utf-8") as f:
                json.dump(self._search_history, f, indent=2, ensure_ascii=False)
        except IOError as e:
            print(f"Warning: Could not save search history: {e}")

    def get_all_sources(self) -> List[Dict]:
        """Get all space sources."""
        return self._sources

    def add_search_history_item(self, query: str, results: List[Dict], confidence_scores: Dict[int, float] = None) -> str:
        """Add a new search history item and return its ID."""
        search_id = str(uuid.uuid4())
        timestamp = int(time.time() * 1000)  # Unix timestamp in milliseconds
        
        history_item = {
            "id": search_id,
            "query": query,
            "timestamp": timestamp,
            "resultCount": len(results),
            "results": results,
            "confidence_scores": confidence_scores or {}
        }
        
        # Add to beginning of list to keep most recent first
        self._search_history.insert(0, history_item)
        
        # Save to JSON file
        self._save_search_history()
        
        return search_id

    def get_search_history(self, user_id: str = None) -> List[Dict]:
        """Get search history. In the future, filter by user_id when authentication is implemented."""
        # For now, return all search history since we don't have user authentication yet
        # TODO: Filter by user_id when JWT authentication is implemented
        return self._search_history

    def delete_search_history_item(self, search_id: str, user_id: str = None) -> bool:
        """Delete a specific search history item. Returns True if deleted, False if not found."""
        # TODO: Validate user ownership when JWT authentication is implemented
        for i, item in enumerate(self._search_history):
            if item["id"] == search_id:
                del self._search_history[i]
                # Save to JSON file
                self._save_search_history()
                return True
        return False

    def search_sources(self, query: str) -> tuple[List[Dict], Dict[int, float]]:
        """
        Search through sources using basic keyword matching.
        Returns (results, confidence_scores) where confidence_scores maps source id to confidence.
        
        This is a simple implementation - in a real app you'd use proper search/ML algorithms.
        """
        if not query.strip():
            return [], {}
        
        query_lower = query.lower()
        results = []
        confidence_scores = {}
        
        for source in self._sources:
            # Simple scoring based on keyword matches in name and description
            score = 0
            searchable_text = f"{source['name']} {source['description']}".lower()
            
            # Count keyword matches (basic implementation)
            query_words = query_lower.split()
            total_words = len(query_words)
            matches = 0
            
            for word in query_words:
                if word in searchable_text:
                    matches += 1
            
            if matches > 0:
                # Calculate confidence as percentage of query words found
                score = (matches / total_words) * 100
                
                # Boost score if query appears as complete phrase
                if query_lower in searchable_text:
                    score = min(100, score * 1.5)
                
                results.append(source)
                confidence_scores[source['id']] = round(score, 2)
        
        # Sort results by confidence score (highest first)
        results.sort(key=lambda x: confidence_scores.get(x['id'], 0), reverse=True)
        
        return results, confidence_scores
