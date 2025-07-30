import { RootState } from '../../store';

// Search selectors
export const selectSearchImages = (state: RootState) => state.search.images;
export const selectSearchLoading = (state: RootState) => state.search.loading;
export const selectSearchError = (state: RootState) => state.search.error;
export const selectSearchHasMore = (state: RootState) => state.search.hasMore;
export const selectSearchPage = (state: RootState) => state.search.page;
export const selectSearchTerm = (state: RootState) => state.search.searchTerm;
export const selectSearchTotalItems = (state: RootState) => state.search.totalItems;
