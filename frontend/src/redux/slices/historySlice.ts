import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { SearchHistoryItem } from '../../types';

// State interface
export interface HistoryState {
  searchHistory: SearchHistoryItem[];
  loading: boolean;
  error: string | null;
}

// Initial state
const initialState: HistoryState = {
  searchHistory: [],
  loading: false,
  error: null,
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
    loadHistoryRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    loadHistorySuccess: (state, action: PayloadAction<SearchHistoryItem[]>) => {
      state.loading = false;
      // Sort history by timestamp in descending order (latest first)
      state.searchHistory = action.payload.sort((a, b) => b.timestamp - a.timestamp);
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
