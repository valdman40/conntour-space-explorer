// Main types for the application
export interface NasaImage {
  id: number;
  name: string;
  description: string;
  type: string;
  launch_date: string;
  image_url: string | null;
  status: string;
}

export interface SearchResult {
  query: string;
  results: NasaImage[];
  confidence_scores?: { [key: number]: number };
  timestamp: number;
  resultCount: number;
}

export interface SearchHistoryItem {
  id: string;
  query: string;
  timestamp: number;
  resultCount: number;
  results: NasaImage[];
  confidence_scores?: { [key: number]: number };
}

// API related types
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  totalPages: number;
  totalItems: number;
  hasMore: boolean;
}
