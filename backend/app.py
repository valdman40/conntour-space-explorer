from typing import List, Optional
import time
import re
from collections import defaultdict

from data.db import SpaceDB
from fastapi import FastAPI, HTTPException, Header, Query, Request
from fastapi.middleware.cors import CORSMiddleware
from models import NasaImage, SearchHistoryItem, Source, PaginatedHistoryResponse, PaginatedSourcesResponse, SearchRequest, SearchResponse
from pydantic import BaseModel, ValidationError

app = FastAPI()

# Rate limiting storage (in production, use Redis or similar)
request_counts = defaultdict(list)
RATE_LIMIT_REQUESTS = 100  # requests per minute
RATE_LIMIT_WINDOW = 60  # seconds

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

db = SpaceDB()


def check_rate_limit(client_ip: str):
    """Check if client has exceeded rate limit."""
    current_time = time.time()
    client_requests = request_counts[client_ip]
    
    # Remove old requests outside the window
    client_requests[:] = [req_time for req_time in client_requests 
                         if current_time - req_time < RATE_LIMIT_WINDOW]
    
    # Check if limit exceeded
    if len(client_requests) >= RATE_LIMIT_REQUESTS:
        raise HTTPException(
            status_code=429, 
            detail=f"Rate limit exceeded. Max {RATE_LIMIT_REQUESTS} requests per minute."
        )
    
    # Add current request
    client_requests.append(current_time)


def sanitize_input(text: str) -> str:
    """Additional input sanitization."""
    if not text:
        return ""
    
    # Remove null bytes and control characters
    text = re.sub(r'[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]', '', text)
    
    # Limit length
    text = text[:1000]
    
    return text.strip()


@app.get("/api/sources", response_model=PaginatedSourcesResponse)
def get_sources(
    page: int = Query(1, ge=1, description="Page number (starts from 1)"),
    limit: int = Query(20, ge=1, le=100, description="Number of items per page (max 100)")
):
    """Get paginated NASA sources/images."""
    paginated_result = db.get_paginated_sources(page=page, limit=limit)
    return paginated_result


@app.get("/api/history", response_model=PaginatedHistoryResponse)
def get_search_history(
    request: Request,
    page: int = Query(1, ge=1, le=10000, description="Page number (starts from 1, max 10000)"),
    page_size: int = Query(100, ge=1, le=100, description="Number of items per page (max 100)"),
    authorization: Optional[str] = Header(None)
):
    """
    Get paginated search history for the current user.
    
    In the future, this will be filtered by user ID extracted from JWT token.
    For now, returns all search history since authentication is not yet implemented.
    """
    # Rate limiting
    client_ip = request.client.host
    check_rate_limit(client_ip)
    
    # TODO: Extract user_id from JWT token when authentication is implemented
    # Example: user_id = extract_user_from_jwt(authorization)
    user_id = None  # Placeholder for future authentication
    
    try:
        paginated_history = db.get_search_history_paginated(user_id, page, page_size)
        return paginated_history
    except Exception as e:
        # Log the error in production
        raise HTTPException(status_code=500, detail="Failed to retrieve search history")


@app.post("/api/search", response_model=SearchResponse)
def search_images(search_request: SearchRequest, request: Request, authorization: Optional[str] = Header(None)):
    """
    Search through NASA images using natural language query.
    Automatically saves search to history.
    """
    # Rate limiting
    client_ip = request.client.host
    check_rate_limit(client_ip)
    
    # Additional sanitization (Pydantic validation already applied)
    query = sanitize_input(search_request.query)
    
    if not query:
        raise HTTPException(status_code=400, detail="Query cannot be empty")
    
    # Additional security checks
    if len(query) > 500:
        raise HTTPException(status_code=400, detail="Query too long (max 500 characters)")
    
    # Check for SQL injection patterns (even though we're not using SQL)
    sql_patterns = [
        r'\b(union|select|insert|update|delete|drop|create|alter|exec|execute)\b',
        r'--',
        r'/\*.*?\*/',
        r'\b(or|and)\s+\d+\s*=\s*\d+',
    ]
    
    for pattern in sql_patterns:
        if re.search(pattern, query.lower()):
            raise HTTPException(status_code=400, detail="Query contains potentially malicious patterns")
    
    try:
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
    
    except ValidationError as e:
        raise HTTPException(status_code=400, detail=f"Validation error: {e}")
    except Exception as e:
        # Log the error in production
        raise HTTPException(status_code=500, detail="Internal server error")


@app.delete("/api/history/{search_id}")
def delete_search_history_item(search_id: str, request: Request, authorization: Optional[str] = Header(None)):
    """
    Delete a specific search history item.
    
    In the future, this will validate that the user owns this search history item.
    """
    # Rate limiting
    client_ip = request.client.host
    check_rate_limit(client_ip)
    
    # Validate search_id format (UUID)
    if not re.match(r'^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$', search_id.lower()):
        raise HTTPException(status_code=400, detail="Invalid search ID format")
    
    # TODO: Extract user_id from JWT token and validate ownership
    user_id = None  # Placeholder for future authentication
    
    try:
        success = db.delete_search_history_item(search_id, user_id)
        if not success:
            raise HTTPException(status_code=404, detail="Search history item not found")
        
        return {"message": "Search history item deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        # Log the error in production
        raise HTTPException(status_code=500, detail="Failed to delete search history item")


@app.delete("/api/history")
def clear_all_search_history(request: Request, authorization: Optional[str] = Header(None)):
    """
    Clear all search history items for the current user.
    
    In the future, this will validate user authentication and only clear their items.
    """
    # Rate limiting
    client_ip = request.client.host
    check_rate_limit(client_ip)
    
    # TODO: Extract user_id from JWT token when authentication is implemented
    user_id = None  # Placeholder for future authentication
    
    try:
        success = db.clear_all_search_history(user_id)
        if not success:
            raise HTTPException(status_code=500, detail="Failed to clear search history")
        
        return {"message": "All search history cleared successfully"}
    except HTTPException:
        raise
    except Exception as e:
        # Log the error in production
        raise HTTPException(status_code=500, detail="Failed to clear search history")
