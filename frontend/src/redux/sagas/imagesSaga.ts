import { call, put, takeEvery, takeLatest, select, delay, fork, cancel, take } from 'redux-saga/effects';
import { PayloadAction } from '@reduxjs/toolkit';
import { NasaImage, SearchHistoryItem } from '../../types';
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
} from '../slices/imagesSlice';
import {
  addSearchToHistorySuccess,
  addSearchToHistoryFailure,
} from '../slices/historySlice';

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
    
    const data: ApiImage[] = await response.json();
    const images = data.map(convertApiImageToNasaImage);
    
    return {
      images,
      total: data.length,
      hasMore: data.length === limit, // If we got fewer than requested, no more pages
    };
  } catch (error) {
    console.error('Error fetching images:', error);
    throw error;
  }
};

// Search images with confidence scores using real API
const searchImagesApi = async (query: string): Promise<SearchHistoryItem> => {
  try {
    const response = await fetch('/api/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const searchResponse = await response.json();
    
    // Convert API response to SearchHistoryItem format
    const searchHistoryItem: SearchHistoryItem = {
      id: Date.now().toString(), // Generate a temporary ID for the frontend
      query: searchResponse.query,
      timestamp: searchResponse.timestamp,
      resultCount: searchResponse.resultCount,
      results: searchResponse.results,
      confidence_scores: searchResponse.confidence_scores,
    };
    
    return searchHistoryItem;
  } catch (error) {
    console.error('Error searching images:', error);
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
function* loadMoreImagesSaga(): Generator<any, void, any> {
  try {
    // Get current page from state
    const state: any = yield select();
    const currentPage = state.images.page;
    const nextPage = currentPage + 1;
    
    const response: { images: NasaImage[]; total: number; hasMore: boolean } = yield call(fetchImages, nextPage, 20);
    yield put(loadMoreImagesSuccess({
      images: response.images,
      hasMore: response.hasMore,
    }));
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to load more images';
    yield put(loadMoreImagesFailure(errorMessage));
  }
}

// Worker saga: Search images with debouncing
function* searchImagesSaga(action: PayloadAction<{ query: string }>): Generator<any, void, any> {
  try {
    const { query } = action.payload;
    
    const historyItem: SearchHistoryItem = yield call(searchImagesApi, query);
    
    yield put(searchImagesSuccess({
      images: historyItem.results,
      hasMore: false, // No pagination for search
      totalItems: historyItem.resultCount,
      isLoadMore: false,
    }));

    // Add to search history using the historyItem from the response
    if (historyItem && historyItem.id) {
      yield put(addSearchToHistorySuccess(historyItem));
    }
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
    
    // If query is empty, load all images (regular page)
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

function* watchSearchImages() {
  yield takeLatest(searchImagesRequest.type, searchImagesSaga);
}

function* watchDebouncedSearchImages() {
  yield takeLatest(searchImagesDebounced.type, debouncedSearchImagesSaga);
}

// Root saga
export default function* imagesSaga() {
  yield fork(watchLoadImages);
  yield fork(watchLoadMoreImages);
  yield fork(watchSearchImages);
  yield fork(watchDebouncedSearchImages);
}
