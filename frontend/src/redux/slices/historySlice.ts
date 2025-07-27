import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { SearchHistoryItem, PaginatedHistoryResponse } from '../../types';

// State interface
export interface HistoryState {
  searchHistory: SearchHistoryItem[];
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

// Initial state
const initialState: HistoryState = {
  searchHistory: [],
  loading: false,
  error: null,
  pagination: {
    page: 1,
    pageSize: 100,
    totalItems: 0,
    totalPages: 0,
    hasNext: false,
    hasPrevious: false,
  },
};

// Redux slice
const historySlice = createSlice({
  name: 'history',
  initialState,
  reducers: {
    // Add search to history
    addSearchToHistoryRequest: (state, action: PayloadAction<SearchHistoryItem>) => {
      state.loading = true;
      state.error = null;
    },
    addSearchToHistorySuccess: (state, action: PayloadAction<SearchHistoryItem>) => {
      state.loading = false;
      
      // Always add new search to the beginning of the array, even if same query exists
      state.searchHistory.unshift(action.payload);
      
      state.error = null;
    },
    addSearchToHistoryFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Remove search from history
    removeSearchFromHistoryRequest: (state, action: PayloadAction<string>) => {
      state.loading = true;
      state.error = null;
    },
    removeSearchFromHistorySuccess: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.searchHistory = state.searchHistory.filter(item => item.id !== action.payload);
      state.error = null;
    },
    removeSearchFromHistoryFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Clear all history
    clearHistoryRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    clearHistorySuccess: (state) => {
      state.loading = false;
      state.searchHistory = [];
      state.error = null;
    },
    clearHistoryFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Load history (for persistence)
    loadHistoryRequest: (state, action: PayloadAction<{ page?: number; pageSize?: number }>) => {
      state.loading = true;
      state.error = null;
    },
    loadHistorySuccess: (state, action: PayloadAction<PaginatedHistoryResponse>) => {
      state.loading = false;
      state.searchHistory = action.payload.items;
      state.pagination = {
        page: action.payload.page,
        pageSize: action.payload.page_size,
        totalItems: action.payload.total_items,
        totalPages: action.payload.total_pages,
        hasNext: action.payload.has_next,
        hasPrevious: action.payload.has_previous,
      };
      state.error = null;
    },
    loadHistoryFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Utility actions
    clearHistoryError: (state) => {
      state.error = null;
    },
  },
});

// Export actions
export const {
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
  clearHistoryError,
} = historySlice.actions;

// Export reducer
export default historySlice.reducer;
