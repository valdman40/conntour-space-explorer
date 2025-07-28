import { call, put, takeEvery, fork } from 'redux-saga/effects';
import { PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { SearchHistoryItem, PaginatedHistoryResponse } from '../../types';
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
} from '../slices/historySlice';

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
    // Delete from API
    yield call(deleteHistoryFromAPI, action.payload);
    yield put(removeSearchFromHistorySuccess(action.payload));
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to remove search from history';
    yield put(removeSearchFromHistoryFailure(errorMessage));
  }
}

// Worker saga: Clear all history
function* clearHistorySaga() {
  try {
    // Call the API to clear all history
    yield call(clearAllHistoryFromAPI);
    
    // Also clear local storage as backup
    yield call(saveHistoryToStorage, []);
    
    yield put(clearHistorySuccess());
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to clear history';
    yield put(clearHistoryFailure(errorMessage));
  }
}

// Worker saga: Load history
function* loadHistorySaga(action: PayloadAction<{ page?: number; pageSize?: number }> = { type: '', payload: {} }) {
  try {
    console.log('Loading history from API...');
    const { page = 1, pageSize = 100 } = action.payload || {};
    const response: PaginatedHistoryResponse = yield call(loadHistoryFromAPI, page, pageSize);
    console.log('History loaded successfully:', response);
    
    // Map backend response to frontend format
    const paginatedResponse: PaginatedHistoryResponse = {
      items: response.items,
      page: response.page,
      page_size: response.page_size,
      total_items: response.total_items,
      total_pages: response.total_pages,
      has_next: response.has_next,
      has_previous: response.has_previous
    };
    
    yield put(loadHistorySuccess(paginatedResponse));
  } catch (error) {
    console.error('Error loading history:', error);
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
  console.log('History saga watcher started - listening for loadHistoryRequest');
  console.log('Listening for action type:', loadHistoryRequest.type);
  yield takeEvery(loadHistoryRequest.type, loadHistorySaga);
}

// Root saga
export default function* historySaga() {
  console.log('History saga initialized');
  yield fork(watchAddSearchToHistory);
  yield fork(watchRemoveSearchFromHistory);
  yield fork(watchClearHistory);
  yield fork(watchLoadHistory);
}
