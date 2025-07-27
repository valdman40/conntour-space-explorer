from typing import Dict, List, Optional
from pydantic import BaseModel, Field, validator
import re


class Source(BaseModel):
    id: int
    name: str
    type: str
    launch_date: str
    description: str
    image_url: Optional[str]
    status: str


class NasaImage(BaseModel):
    id: int
    name: str
    description: str
    type: str
    launch_date: str
    image_url: Optional[str]
    status: str


class SearchHistoryItem(BaseModel):
    id: str
    query: str
    timestamp: int
    resultCount: int
    results: List[NasaImage]
    confidence_scores: Optional[Dict[int, float]] = None


class PaginatedHistoryResponse(BaseModel):
    items: List[SearchHistoryItem]
    page: int
    page_size: int
    total_items: int
    total_pages: int
    has_next: bool
    has_previous: bool


class PaginatedSourcesResponse(BaseModel):
    items: List[Source]
    page: int
    limit: int
    total_items: int
    has_more: bool
    returned_count: int


class SearchRequest(BaseModel):
    query: str = Field(
        min_length=1,
        max_length=500,
        description="Search query for NASA images"
    )
    
    @validator('query')
    def validate_query(cls, v):
        if not v or not v.strip():
            raise ValueError('Query cannot be empty or only whitespace')
        
        # Remove potential script tags and dangerous characters
        dangerous_patterns = [
            r'<script[^>]*>.*?</script>',
            r'javascript:',
            r'vbscript:',
            r'onload=',
            r'onerror=',
            r'onclick=',
            r'eval\(',
            r'exec\(',
            r'__import__',
            r'subprocess',
            r'os\.system',
            r'eval\s*\(',
        ]
        
        query_lower = v.lower()
        for pattern in dangerous_patterns:
            if re.search(pattern, query_lower, re.IGNORECASE):
                raise ValueError(f'Query contains potentially dangerous content: {pattern}')
        
        # Limit special characters
        if len(re.findall(r'[<>{}[\]\\|`~]', v)) > 10:
            raise ValueError('Query contains too many special characters')
        
        # Check for excessive repetition (potential DoS)
        if re.search(r'(.)\1{50,}', v):
            raise ValueError('Query contains excessive character repetition')
            
        return v.strip()


class SearchResponse(BaseModel):
    query: str
    results: List[NasaImage]
    confidence_scores: Dict[int, float]
    timestamp: int
    resultCount: int
