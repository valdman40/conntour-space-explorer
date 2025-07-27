import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../redux/store';
import { 
  addSearchToHistoryRequest,
  loadHistoryRequest,
  clearHistoryRequest,
  removeSearchFromHistoryRequest
} from '../redux/slices/historySlice';
import { SearchHistoryItem } from '../types';

export const useReduxSearchHistory = () => {
  const dispatch = useAppDispatch();
  
  const searchHistory = useAppSelector(state => state.history.searchHistory);
  const loading = useAppSelector(state => state.history.loading);
  const error = useAppSelector(state => state.history.error);

  const handleAddSearchTerm = useCallback((searchItem: SearchHistoryItem) => {
    dispatch(addSearchToHistoryRequest(searchItem));
  }, [dispatch]);

  const handleLoadSearchHistory = useCallback(() => {
    console.log('Dispatching loadHistoryRequest action');
    console.log('Action type:', loadHistoryRequest.type);
    dispatch(loadHistoryRequest());
  }, [dispatch]);

  const handleClearSearchHistory = useCallback(() => {
    dispatch(clearHistoryRequest());
  }, [dispatch]);

  const handleRemoveSearchTerm = useCallback((term: string) => {
    dispatch(removeSearchFromHistoryRequest(term));
  }, [dispatch]);

  return {
    // State
    // history should return in order of most recent first
    searchHistory: [...searchHistory].sort((a, b) => b.timestamp - a.timestamp),
    loading,
    error,
    
    // Actions
    addSearchTerm: handleAddSearchTerm,
    loadSearchHistory: handleLoadSearchHistory,
    clearSearchHistory: handleClearSearchHistory,
    removeSearchTerm: handleRemoveSearchTerm,
  };
};
