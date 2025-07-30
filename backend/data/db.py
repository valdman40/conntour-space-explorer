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

    def get_paginated_sources(self, page: int = 1, limit: int = 20) -> Dict:
        """Get paginated space sources with metadata."""
        # Calculate offset
        offset = (page - 1) * limit
        total_items = len(self._sources)
        
        # Get the requested page of sources
        items = self._sources[offset:offset + limit]
        
        # Calculate if there are more pages
        has_more = offset + len(items) < total_items
        
        return {
            "items": items,
            "page": page,
            "limit": limit,
            "total_items": total_items,
            "has_more": has_more,
            "returned_count": len(items)
        }

    def add_search_history_item(self, query: str, results: List[Dict], confidence_scores: Dict[int, float] = None, total_count: int = None) -> str:
        """Add a new search history item and return its ID."""
        search_id = str(uuid.uuid4())
        timestamp = int(time.time() * 1000)  # Unix timestamp in milliseconds
        
        # Use total_count if provided, otherwise fall back to length of results
        result_count = total_count if total_count is not None else len(results)
        
        history_item = {
            "id": search_id,
            "query": query,
            "timestamp": timestamp,
            "resultCount": result_count,  # Use total count, not just current page
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

    def get_search_history_paginated(self, user_id: str = None, page: int = 1, page_size: int = 100) -> Dict:
        """Get paginated search history. In the future, filter by user_id when authentication is implemented."""
        # For now, return all search history since we don't have user authentication yet
        # TODO: Filter by user_id when JWT authentication is implemented
        
        # Calculate pagination
        total_items = len(self._search_history)
        total_pages = (total_items + page_size - 1) // page_size  # Ceiling division
        
        # Calculate offset
        offset = (page - 1) * page_size
        
        # Get paginated items
        items = self._search_history[offset:offset + page_size]
        
        # Calculate pagination flags
        has_next = page < total_pages
        has_previous = page > 1
        
        return {
            "items": items,
            "page": page,
            "page_size": page_size,
            "total_items": total_items,
            "total_pages": total_pages,
            "has_next": has_next,
            "has_previous": has_previous
        }

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

    def clear_all_search_history(self, user_id: str = None) -> bool:
        """Clear all search history items. Returns True if successful."""
        # TODO: Filter by user_id when JWT authentication is implemented
        try:
            self._search_history.clear()
            self._save_search_history()
            return True
        except Exception as e:
            print(f"Error clearing search history: {e}")
            return False

    def search_sources(self, query: str, page: int = 1, page_size: int = 20) -> tuple[List[Dict], Dict[int, float], bool, int]:
        """
        Search through sources using basic keyword matching with pagination.
        Returns (results, confidence_scores, has_more, total_count) where:
        - results: paginated list of matching sources
        - confidence_scores: maps source id to confidence for all results (not just current page)
        - has_more: boolean indicating if there are more pages
        - total_count: total number of matching results across all pages
        
        This is a simple implementation - in a real app you'd use proper search/ML algorithms.
        """
        if not query.strip():
            return [], {}, False, 0
        
        query_lower = query.lower()
        all_results = []
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
                
                all_results.append(source)
                confidence_scores[source['id']] = round(score, 2)
        
        # Sort all results by confidence score (highest first)
        all_results.sort(key=lambda x: confidence_scores.get(x['id'], 0), reverse=True)
        
        # Apply pagination
        start_index = (page - 1) * page_size
        end_index = start_index + page_size
        paginated_results = all_results[start_index:end_index]
        
        # Determine if there are more pages
        has_more = end_index < len(all_results)
        
        # Total count of all matching results
        total_count = len(all_results)
        
        return paginated_results, confidence_scores, has_more, total_count
