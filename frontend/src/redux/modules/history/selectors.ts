import { RootState } from '../../store';

// History selectors
export const selectHistoryItems = (state: RootState) => state.history.searchHistory;
export const selectHistoryLoading = (state: RootState) => state.history.loading;
export const selectHistoryError = (state: RootState) => state.history.error;
export const selectHistoryPagination = (state: RootState) => state.history.pagination;
