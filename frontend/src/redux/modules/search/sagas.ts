import { call, put, takeEvery, takeLatest, select, delay, fork } from 'redux-saga/effects';
import { PayloadAction } from '@reduxjs/toolkit';
import { NasaImage, SearchHistoryItem } from '../../../types';
import {
  loadImagesRequest,
  loadImagesSuccess,
  loadImagesFailure,
  loadMoreImagesRequest,
  loadMoreImagesSuccess,
  loadMoreImagesFailure,
  searchImagesRequest,
  searchImagesDebounced,
  searchImagesSuccess,
  searchImagesFailure,
  loadMoreSearchResultsRequest,
  loadMoreSearchResultsSuccess,
  loadMoreSearchResultsFailure,
} from './reducer';
import {
  addSearchToHistorySuccess,
  addSearchToHistoryFailure,
} from '../history/reducer';

// API response interfaces
interface ApiImage {
  id: number;
  name: string;
  type: string;
  launch_date: string;
  description: string;
  image_url: string | null;
  status: string;
}

interface SearchResponse {
  query: string;
  results: NasaImage[];
  confidence_scores: Record<number, number>;
  timestamp: number;
  resultCount: number;
  page: number;
  pageSize: number;
  has_more: boolean;
}

// Convert API image to NasaImage
const convertApiImageToNasaImage = (apiImage: ApiImage): NasaImage => ({
  id: apiImage.id,
  name: apiImage.name,
  description: apiImage.description,
  type: apiImage.type,
  launch_date: apiImage.launch_date,
  image_url: apiImage.image_url,
  status: apiImage.status,
});

// Fetch images from API
const fetchImages = async (page: number = 1, limit: number = 20): Promise<{ images: NasaImage[]; total: number; hasMore: boolean }> => {
  try {
    const response = await fetch(`/api/sources?page=${page}&limit=${limit}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Handle new paginated response format
    const images = data.items.map(convertApiImageToNasaImage);
    
    return {
      images,
      total: data.returned_count,
      hasMore: data.has_more, // Use the accurate has_more from backend
    };
  } catch (error) {
    console.error('Error fetching images:', error);
    throw error;
  }
};

// Search images with confidence scores using real API
const searchImagesApi = async (query: string): Promise<SearchResponse> => {
  try {
    const response = await fetch('/api/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        query, 
        page: 1, 
        pageSize: 20,
        skipHistory: false // Create history for first search
      }),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const searchResponse = await response.json();
    
    // Return the full SearchResponse
    return searchResponse;
  } catch (error) {
    console.error('Error searching images:', error);
    throw error;
  }
};

// Load more search results (pagination for search without creating history)
const loadMoreSearchResultsApi = async (query: string, page: number, pageSize: number): Promise<{ images: NasaImage[]; hasMore: boolean }> => {
  try {
    const response = await fetch('/api/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        query, 
        page, 
        pageSize,
        skipHistory: true // Flag to indicate this shouldn't create history
      }),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const searchResponse = await response.json();
    
    return {
      images: searchResponse.results,
      hasMore: searchResponse.has_more || false,
    };
  } catch (error) {
    console.error('Error loading more search results:', error);
    throw error;
  }
};

// Worker saga: Load all images
function* loadImagesSaga(): Generator<any, void, any> {
  try {
    const response: { images: NasaImage[]; total: number; hasMore: boolean } = yield call(fetchImages, 1, 20);
    yield put(loadImagesSuccess({
      images: response.images,
      hasMore: response.hasMore,
      totalItems: response.total,
    }));
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to load images';
    yield put(loadImagesFailure(errorMessage));
  }
}

// Worker saga: Load more images (pagination)
function* loadMoreImagesSaga(action: PayloadAction<{ page: number; pageSize: number }>): Generator<any, void, any> {
  try {
    const { page, pageSize } = action.payload;
    
    const response: { images: NasaImage[]; total: number; hasMore: boolean } = yield call(fetchImages, page, pageSize);
    yield put(loadMoreImagesSuccess({
      images: response.images,
      hasMore: response.hasMore,
    }));
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to load more images';
    yield put(loadMoreImagesFailure(errorMessage));
  }
}

// Worker saga: Load more search results (pagination for search without creating history)
function* loadMoreSearchResultsSaga(action: PayloadAction<{ query: string; page: number; pageSize: number }>): Generator<any, void, any> {
  try {
    const { query, page, pageSize } = action.payload;
    
    const response: { images: NasaImage[]; hasMore: boolean } = yield call(loadMoreSearchResultsApi, query, page, pageSize);
    yield put(loadMoreSearchResultsSuccess({
      images: response.images,
      hasMore: response.hasMore,
    }));
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to load more search results';
    yield put(loadMoreSearchResultsFailure(errorMessage));
  }
}

// Worker saga: Search images with debouncing
function* searchImagesSaga(action: PayloadAction<{ query: string }>): Generator<any, void, any> {
  try {
    const { query } = action.payload;
    
    const response: SearchResponse = yield call(searchImagesApi, query);
    
    yield put(searchImagesSuccess({
      images: response.results,
      hasMore: response.has_more,
      totalItems: response.resultCount,
      isLoadMore: false,
    }));

    // Add to search history: create a SearchHistoryItem from the response
    const historyItem: SearchHistoryItem = {
      id: Date.now().toString(), // Generate a temporary ID for the frontend
      query: response.query,
      timestamp: response.timestamp,
      results: response.results,
      resultCount: response.resultCount,
      confidence_scores: response.confidence_scores,
    };
    
    // Add the search to history
    yield put(addSearchToHistorySuccess(historyItem));
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Search failed';
    yield put(searchImagesFailure(errorMessage));
    yield put(addSearchToHistoryFailure(errorMessage));
  }
}

// Worker saga: Debounced search images
function* debouncedSearchImagesSaga(action: PayloadAction<{ query: string }>): Generator<any, void, any> {
  try {
    const { query } = action.payload;
    
    // Add debouncing - wait 500ms before executing search
    yield delay(500);
    
    // Check if we're already loading to prevent multiple concurrent requests
    const state: any = yield select();
    if (state.search.loading) {
      console.log('Already loading, skipping debounced search');
      return;
    }
    
    // If query is empty, load all images directly
    if (!query.trim()) {
      yield put(loadImagesRequest());
    } else {
      // Dispatch the actual search request
      yield put(searchImagesRequest({ query: query.trim() }));
    }
  } catch (error) {
    console.error('Debounced search error:', error);
  }
}

// Watcher sagas
function* watchLoadImages() {
  yield takeLatest(loadImagesRequest.type, loadImagesSaga);
}

function* watchLoadMoreImages() {
  yield takeEvery(loadMoreImagesRequest.type, loadMoreImagesSaga);
}

function* watchLoadMoreSearchResults() {
  yield takeEvery(loadMoreSearchResultsRequest.type, loadMoreSearchResultsSaga);
}

function* watchSearchImages() {
  yield takeLatest(searchImagesRequest.type, searchImagesSaga);
}

function* watchDebouncedSearchImages() {
  yield takeLatest(searchImagesDebounced.type, debouncedSearchImagesSaga);
}

// Root saga
export default function* searchSaga() {
  yield fork(watchLoadImages);
  yield fork(watchLoadMoreImages);
  yield fork(watchLoadMoreSearchResults);
  yield fork(watchSearchImages);
  yield fork(watchDebouncedSearchImages);
}
