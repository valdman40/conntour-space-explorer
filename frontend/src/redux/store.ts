import { configureStore } from '@reduxjs/toolkit';
import createSagaMiddleware from 'redux-saga';
import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';

// Import reducers
import imagesReducer, { ImagesState } from './slices/imagesSlice';
import historyReducer, { HistoryState } from './slices/historySlice';

// Import root saga
import rootSaga from './sagas';

// Create saga middleware
const sagaMiddleware = createSagaMiddleware();

// Configure store
export const store = configureStore({
  reducer: {
    images: imagesReducer,
    history: historyReducer,
  },
  middleware: (getDefaultMiddleware: any) =>
    getDefaultMiddleware({
      thunk: false, // We're using Redux Saga instead of thunk
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }).concat(sagaMiddleware),
  devTools: process.env.NODE_ENV !== 'production',
});

// Run the root saga
sagaMiddleware.run(rootSaga);

// Types
export type RootState = {
  images: ImagesState;
  history: HistoryState;
};
export type AppDispatch = typeof store.dispatch;

// Typed hooks
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// Selectors
export const selectImages = (state: RootState) => state.images.images;
export const selectImagesLoading = (state: RootState) => state.images.loading;
export const selectImagesError = (state: RootState) => state.images.error;
export const selectImagesHasMore = (state: RootState) => state.images.hasMore;
export const selectImagesPage = (state: RootState) => state.images.page;
export const selectSearchTerm = (state: RootState) => state.images.searchTerm;
export const selectTotalItems = (state: RootState) => state.images.totalItems;

export const selectSearchHistory = (state: RootState) => 
  [...state.history.searchHistory].sort((a, b) => b.timestamp - a.timestamp);
export const selectHistoryLoading = (state: RootState) => state.history.loading;
export const selectHistoryError = (state: RootState) => state.history.error;
