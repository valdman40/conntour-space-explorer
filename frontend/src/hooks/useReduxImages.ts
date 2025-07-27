import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../redux/store';
import { 
  loadImagesRequest, 
  loadMoreImagesRequest, 
  searchImagesRequest, 
  searchImagesDebounced,
  clearImages,
  setSearchTerm 
} from '../redux/slices/imagesSlice';

export const useReduxImages = () => {
  const dispatch = useAppDispatch();
  
  const images = useAppSelector(state => state.images.images);
  const loading = useAppSelector(state => state.images.loading);
  const error = useAppSelector(state => state.images.error);
  const hasMore = useAppSelector(state => state.images.hasMore);
  const page = useAppSelector(state => state.images.page);
  const searchTerm = useAppSelector(state => state.images.searchTerm);
  const totalItems = useAppSelector(state => state.images.totalItems);

  const handleLoadImages = useCallback(() => {
    dispatch(loadImagesRequest());
  }, [dispatch]);

  const handleLoadMoreImages = useCallback(() => {
    dispatch(loadMoreImagesRequest());
  }, [dispatch]);

  const handleSearchImages = useCallback((query: string) => {
    dispatch(setSearchTerm(query));
    dispatch(searchImagesRequest({ query }));
  }, [dispatch]);

  const handleSearchImagesDebounced = useCallback((query: string) => {
    dispatch(setSearchTerm(query));
    dispatch(searchImagesDebounced({ query }));
  }, [dispatch]);

  const handleClearImages = useCallback(() => {
    dispatch(clearImages());
  }, [dispatch]);

  const handleSetSearchTerm = useCallback((term: string) => {
    dispatch(setSearchTerm(term));
  }, [dispatch]);

  return {
    images,
    loading,
    error,
    hasMore,
    page,
    searchTerm,
    totalItems,
    
    // Actions
    loadImages: handleLoadImages,
    loadMoreImages: handleLoadMoreImages,
    searchImages: handleSearchImages,
    searchImagesDebounced: handleSearchImagesDebounced,
    clearImages: handleClearImages,
    setSearchTerm: handleSetSearchTerm,
  };
};
