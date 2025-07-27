from typing import List, Optional

from data.db import SpaceDB
from fastapi import FastAPI, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from models import NasaImage, SearchHistoryItem, Source
from pydantic import BaseModel

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

db = SpaceDB()


# Request/Response models for search
class SearchRequest(BaseModel):
    query: str


class SearchResponse(BaseModel):
    query: str
    results: List[NasaImage]
    confidence_scores: dict[int, float]
    timestamp: int
    resultCount: int


@app.get("/api/sources", response_model=List[Source])
def get_sources():
    """Get all available NASA sources/images."""
    sources = db.get_all_sources()
    return sources


@app.get("/api/history", response_model=List[SearchHistoryItem])
def get_search_history(authorization: Optional[str] = Header(None)):
    """
    Get search history for the current user.
    
    In the future, this will be filtered by user ID extracted from JWT token.
    For now, returns all search history since authentication is not yet implemented.
    """
    # TODO: Extract user_id from JWT token when authentication is implemented
    # Example: user_id = extract_user_from_jwt(authorization)
    user_id = None  # Placeholder for future authentication
    
    history = db.get_search_history(user_id)
    return history


@app.post("/api/search", response_model=SearchResponse)
def search_images(search_request: SearchRequest, authorization: Optional[str] = Header(None)):
    """
    Search through NASA images using natural language query.
    Automatically saves search to history.
    """
    query = search_request.query.strip()
    if not query:
        raise HTTPException(status_code=400, detail="Query cannot be empty")
    
    # Perform search
    results, confidence_scores = db.search_sources(query)
    
    # Convert results to NasaImage format
    nasa_images = [NasaImage(**result) for result in results]
    
    # Save to search history
    # TODO: Extract user_id from JWT token when authentication is implemented
    user_id = None  # Placeholder for future authentication
    
    timestamp = int(__import__('time').time() * 1000)
    search_id = db.add_search_history_item(
        query=query,
        results=results,
        confidence_scores=confidence_scores
    )
    
    return SearchResponse(
        query=query,
        results=nasa_images,
        confidence_scores=confidence_scores,
        timestamp=timestamp,
        resultCount=len(nasa_images)
    )


@app.delete("/api/history/{search_id}")
def delete_search_history_item(search_id: str, authorization: Optional[str] = Header(None)):
    """
    Delete a specific search history item.
    
    In the future, this will validate that the user owns this search history item.
    """
    # TODO: Extract user_id from JWT token and validate ownership
    user_id = None  # Placeholder for future authentication
    
    success = db.delete_search_history_item(search_id, user_id)
    if not success:
        raise HTTPException(status_code=404, detail="Search history item not found")
    
    return {"message": "Search history item deleted successfully"}
