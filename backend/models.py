from typing import Dict, List, Optional

from pydantic import BaseModel


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
