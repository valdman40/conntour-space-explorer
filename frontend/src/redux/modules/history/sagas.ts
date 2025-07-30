import { call, put, takeEvery, fork } from 'redux-saga/effects';
import { PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { SearchHistoryItem, PaginatedHistoryResponse } from '../../../types';
import {
  addSearchToHistoryRequest,
  addSearchToHistorySuccess,
  addSearchToHistoryFailure,
  removeSearchFromHistoryRequest,
  removeSearchFromHistorySuccess,
  removeSearchFromHistoryFailure,
  clearHistoryRequest,
  clearHistorySuccess,
  clearHistoryFailure,
  loadHistoryRequest,
  loadHistorySuccess,
  loadHistoryFailure,
} from './reducer';

// Local storage key
const HISTORY_STORAGE_KEY = 'nasa-space-explorer-history';

// API endpoints
const API_BASE_URL = 'http://localhost:5000';

// API helper functions
async function loadHistoryFromAPI(page: number = 1, pageSize: number = 100): Promise<PaginatedHistoryResponse> {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/history?page=${page}&page_size=${pageSize}`);
    return response.data;
  } catch (error) {
    console.error('Failed to load history from API:', error);
    throw error;
  }
}

async function deleteHistoryFromAPI(searchId: string): Promise<void> {
  try {
    await axios.delete(`${API_BASE_URL}/api/history/${searchId}`);
  } catch (error) {
    console.error('Failed to delete history from API:', error);
    throw error;
  }
}

async function clearAllHistoryFromAPI(): Promise<void> {
  try {
    await axios.delete(`${API_BASE_URL}/api/history`);
  } catch (error) {
    console.error('Failed to clear all history from API:', error);
    throw error;
  }
}

// Helper functions for local storage (keeping as backup)
function* saveHistoryToStorage(history: SearchHistoryItem[]) {
  try {
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
  } catch (error) {
    console.error('Failed to save history to localStorage:', error);
  }
}

function* loadHistoryFromStorage(): Generator<any, SearchHistoryItem[], any> {
  try {
    const stored = localStorage.getItem(HISTORY_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Failed to load history from localStorage:', error);
    return [];
  }
}

// Worker saga: Add search to history
function* addSearchToHistorySaga(action: PayloadAction<SearchHistoryItem>) {
  try {
    // Get current history from storage
    const currentHistory: SearchHistoryItem[] = yield call(loadHistoryFromStorage);
    
    // Check if search with same query already exists
    const existingIndex = currentHistory.findIndex(
      item => item.query.toLowerCase() === action.payload.query.toLowerCase()
    );
    
    let updatedHistory: SearchHistoryItem[];
    if (existingIndex !== -1) {
      // Update existing search
      updatedHistory = [...currentHistory];
      updatedHistory[existingIndex] = action.payload;
    } else {
      // Add new search to the beginning
      updatedHistory = [action.payload, ...currentHistory];
    }
    
    // Save to storage
    yield call(saveHistoryToStorage, updatedHistory);
    yield put(addSearchToHistorySuccess(action.payload));
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to add search to history';
    yield put(addSearchToHistoryFailure(errorMessage));
  }
}

// Worker saga: Remove search from history
function* removeSearchFromHistorySaga(action: PayloadAction<string>) {
  try {
    const searchId = action.payload;
    
    // Try to delete from API first
    yield call(deleteHistoryFromAPI, searchId);
    
    // Also remove from local storage
    const currentHistory: SearchHistoryItem[] = yield call(loadHistoryFromStorage);
    const updatedHistory = currentHistory.filter(item => item.id !== searchId);
    yield call(saveHistoryToStorage, updatedHistory);
    
    yield put(removeSearchFromHistorySuccess(searchId));
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to remove search from history';
    yield put(removeSearchFromHistoryFailure(errorMessage));
  }
}

// Worker saga: Clear all history
function* clearHistorySaga() {
  try {
    // Try to clear from API first
    yield call(clearAllHistoryFromAPI);
    
    // Also clear from local storage
    yield call(saveHistoryToStorage, []);
    
    yield put(clearHistorySuccess());
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to clear history';
    yield put(clearHistoryFailure(errorMessage));
  }
}

// Worker saga: Load history
function* loadHistorySaga(action: PayloadAction<{ page?: number; pageSize?: number }>) {
  try {
    const { page = 1, pageSize = 100 } = action.payload;
    
    try {
      // Try to load from API first
      const apiHistory: PaginatedHistoryResponse = yield call(loadHistoryFromAPI, page, pageSize);
      yield put(loadHistorySuccess(apiHistory));
    } catch (apiError) {
      console.warn('API unavailable, falling back to localStorage:', apiError);
      
      // Fallback to localStorage
      const localHistory: SearchHistoryItem[] = yield call(loadHistoryFromStorage);
      
      // Create pagination info for local storage
      const totalItems = localHistory.length;
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const items = localHistory.slice(startIndex, endIndex);
      
      const paginatedResponse: PaginatedHistoryResponse = {
        items,
        page,
        page_size: pageSize,
        total_items: totalItems,
        total_pages: Math.ceil(totalItems / pageSize),
        has_next: endIndex < totalItems,
        has_previous: page > 1,
      };
      
      yield put(loadHistorySuccess(paginatedResponse));
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to load history';
    yield put(loadHistoryFailure(errorMessage));
  }
}

// Watcher sagas
function* watchAddSearchToHistory() {
  yield takeEvery(addSearchToHistoryRequest.type, addSearchToHistorySaga);
}

function* watchRemoveSearchFromHistory() {
  yield takeEvery(removeSearchFromHistoryRequest.type, removeSearchFromHistorySaga);
}

function* watchClearHistory() {
  yield takeEvery(clearHistoryRequest.type, clearHistorySaga);
}

function* watchLoadHistory() {
  yield takeEvery(loadHistoryRequest.type, loadHistorySaga);
}

// Root saga
export default function* historySaga() {
  yield fork(watchAddSearchToHistory);
  yield fork(watchRemoveSearchFromHistory);
  yield fork(watchClearHistory);
  yield fork(watchLoadHistory);
}
