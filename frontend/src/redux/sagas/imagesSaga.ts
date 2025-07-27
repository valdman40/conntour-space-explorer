import { call, put, takeEvery, takeLatest, select, delay, fork } from 'redux-saga/effects';
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
const fetchImages = async (page: number = 1): Promise<{ images: NasaImage[]; total: number }> => {
  try {
    const response = await fetch(`/api/sources?page=${page}&limit=20`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data: ApiImage[] = await response.json();
    const images = data.map(convertApiImageToNasaImage);
    
    return {
      images,
      total: data.length, // For now, assume total is the current page length
    };
  } catch (error) {
    console.error('Error fetching images:', error);
    throw error;
  }
};

// Search images with confidence scores
const searchImagesApi = async (query: string): Promise<SearchHistoryItem> => {
  try {
    // For now, simulate search by filtering the main data
    // In a real implementation, this would be a separate search endpoint
    const response = await fetch('/api/sources');
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const allData: ApiImage[] = await response.json();
    
    // Simple search implementation - filter by name, description, or type
    const filtered = allData.filter(item => 
      item.name.toLowerCase().includes(query.toLowerCase()) ||
      item.description.toLowerCase().includes(query.toLowerCase()) ||
      item.type.toLowerCase().includes(query.toLowerCase())
    );
    
    // Generate confidence scores (in a real app, this would come from the search algorithm)
    const confidence_scores: { [key: number]: number } = {};
    filtered.forEach(item => {
      const nameMatch = item.name.toLowerCase().includes(query.toLowerCase());
      const descMatch = item.description.toLowerCase().includes(query.toLowerCase());
      const typeMatch = item.type.toLowerCase().includes(query.toLowerCase());
      
      let score = 0;
      if (nameMatch) score += 0.8;
      if (descMatch) score += 0.5;
      if (typeMatch) score += 0.6;
      
      confidence_scores[item.id] = Math.min(score, 1.0);
    });
    
    // Sort by confidence score
    filtered.sort((a, b) => (confidence_scores[b.id] || 0) - (confidence_scores[a.id] || 0));
    
    // Convert API images to NasaImages for the history item
    const convertedImages = filtered.map(convertApiImageToNasaImage);
    
    // Create and return the history item directly
    return {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      query,
      timestamp: Date.now(),
      resultCount: filtered.length,
      results: convertedImages,
      confidence_scores,
    };
  } catch (error) {
    console.error('Error searching images:', error);
    throw error;
  }
};

// Worker saga: Load all images
function* loadImagesSaga(): Generator<any, void, any> {
  try {
    const response: { images: NasaImage[]; total: number } = yield call(fetchImages, 1);
    yield put(loadImagesSuccess({
      images: response.images,
      hasMore: response.images.length >= 20, // Assume more if we got a full page
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
    
    const response: { images: NasaImage[]; total: number } = yield call(fetchImages, nextPage);
    yield put(loadMoreImagesSuccess({
      images: response.images,
      hasMore: response.images.length >= 20, // Assume more if we got a full page
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
    
    // Add debouncing - wait 300ms before executing search
    yield delay(300);
    
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

// Root saga
export default function* imagesSaga() {
  yield fork(watchLoadImages);
  yield fork(watchLoadMoreImages);
  yield fork(watchSearchImages);
}
