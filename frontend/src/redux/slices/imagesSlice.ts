import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { NasaImage } from '../../types';

// State interface
export interface ImagesState {
  images: NasaImage[];
  loading: boolean;
  error: string | null;
  page: number;
  hasMore: boolean;
  searchTerm: string;
  totalItems: number;
}

// Initial state
const initialState: ImagesState = {
  images: [],
  loading: false,
  error: null,
  page: 1,
  hasMore: true,
  searchTerm: '',
  totalItems: 0,
};

// Redux slice
const imagesSlice = createSlice({
  name: 'images',
  initialState,
  reducers: {
    // Loading actions
    loadImagesRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    loadImagesSuccess: (state, action: PayloadAction<{ images: NasaImage[]; hasMore: boolean; totalItems: number }>) => {
      state.loading = false;
      state.images = action.payload.images;
      state.hasMore = action.payload.hasMore;
      state.totalItems = action.payload.totalItems;
      state.error = null;
    },
    loadImagesFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Load more actions (pagination)
    loadMoreImagesRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    loadMoreImagesSuccess: (state, action: PayloadAction<{ images: NasaImage[]; hasMore: boolean }>) => {
      state.loading = false;
      state.images = [...state.images, ...action.payload.images];
      state.hasMore = action.payload.hasMore;
      state.error = null;
      state.page += 1;
    },
    loadMoreImagesFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Search actions
    searchImagesRequest: (state, action: PayloadAction<{ query: string }>) => {
      state.loading = true;
      state.error = null;
      state.searchTerm = action.payload.query;
      // Reset pagination for search
      state.page = 1;
    },
    searchImagesDebounced: (state, action: PayloadAction<{ query: string }>) => {
      // This action will trigger the debounced search saga
      // Don't set loading state here - let the saga handle it
      state.searchTerm = action.payload.query;
    },
    searchImagesSuccess: (state, action: PayloadAction<{ images: NasaImage[]; hasMore: boolean; totalItems: number; isLoadMore?: boolean }>) => {
      state.loading = false;
      if (action.payload.isLoadMore) {
        state.images = [...state.images, ...action.payload.images];
        state.page += 1;
      } else {
        state.images = action.payload.images;
        state.page = 1;
      }
      state.hasMore = action.payload.hasMore;
      state.totalItems = action.payload.totalItems;
      state.error = null;
    },
    searchImagesFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Utility actions
    clearImages: (state) => {
      state.images = [];
      state.page = 1;
      state.hasMore = true;
      state.error = null;
      state.searchTerm = '';
      state.totalItems = 0;
    },
    setSearchTerm: (state, action: PayloadAction<string>) => {
      state.searchTerm = action.payload;
    },
    resetPagination: (state) => {
      state.page = 1;
      state.hasMore = true;
    },
  },
});

// Export actions
export const {
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
  clearImages,
  setSearchTerm,
  resetPagination,
} = imagesSlice.actions;

// Export reducer
export default imagesSlice.reducer;
