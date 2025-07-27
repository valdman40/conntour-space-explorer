import { useCallback } from 'react';
import { useReduxImages } from './useReduxImages';
import { useReduxSearchHistory } from './useReduxSearchHistory';
import { SearchHistoryItem, NasaImage } from '../types';

export const useSearch = () => {
  const { 
    images, 
    loading: imagesLoading, 
    error: imagesError, 
    searchImages,
    setSearchTerm,
    searchTerm 
  } = useReduxImages();
  
  const { 
    searchHistory, 
    loading: historyLoading, 
    addSearchTerm,
    loadSearchHistory
  } = useReduxSearchHistory();

  const handleSearch = useCallback((query: string) => {
    // Set the search term in the images slice
    setSearchTerm(query);
    
    // Trigger the search
    searchImages(query);
  }, [setSearchTerm, searchImages]);

  const handleSaveToHistory = useCallback((query: string, results: NasaImage[], resultCount: number) => {
    const historyItem: SearchHistoryItem = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      query,
      timestamp: Date.now(),
      resultCount,
      results,
    };
    
    addSearchTerm(historyItem);
  }, [addSearchTerm]);

  return {
    // State
    images,
    searchHistory,
    searchTerm,
    loading: imagesLoading || historyLoading,
    error: imagesError,
    
    // Actions
    search: handleSearch,
    saveToHistory: handleSaveToHistory,
    loadHistory: loadSearchHistory,
  };
};
