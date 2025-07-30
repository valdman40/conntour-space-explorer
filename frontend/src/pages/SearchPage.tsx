import React, { useEffect, useCallback, useRef } from 'react';
import styled, { keyframes } from 'styled-components';
import { useTranslation } from 'react-i18next';
import {
    LoadingSpinner,
    ErrorMessage,
    LoadMoreSection
} from '../components/common';
import { NasaImagesList } from '../components/NasaImagesList';
import { useAppDispatch, useAppSelector } from '../redux/store';
import {
    selectSearchImages,
    selectSearchLoading,
    selectSearchError,
    selectSearchHasMore,
    selectSearchTerm,
    selectSearchPage
} from '../redux/modules/search/selectors';
import {
    loadImagesRequest,
    loadMoreImagesRequest,
    searchImagesRequest,
    clearImages,
    setSearchTerm
} from '../redux/modules/search/reducer';
import { loadHistoryRequest } from '../redux/modules/history/reducer';
import { sizes } from '../constants/sizes';
import { colors } from '../constants/colors';

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const SearchPageContainer = styled.div`
  animation: ${fadeIn} 0.3s ease-in-out;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const ScrollSentinel = styled.div`
  height: ${sizes.spacing.xl};
  margin: ${sizes.margin.md} 0;
`;

const SearchResultsInfo = styled.div`
  padding: ${sizes.padding.md} 0;
  text-align: center;
  color: ${colors.text.secondary};
  font-size: ${sizes.fontSize.sm};
  margin-bottom: ${sizes.margin.md};
`;

interface SearchPageProps {
    onReload?: () => void;
    searchTerm?: string;
}

export const SearchPage: React.FC<SearchPageProps> = ({ onReload, searchTerm: externalSearchTerm }) => {
    const { t } = useTranslation();
    const dispatch = useAppDispatch();

    // Redux selectors
    const images = useAppSelector(selectSearchImages);
    const loading = useAppSelector(selectSearchLoading);
    const error = useAppSelector(selectSearchError);
    const hasMore = useAppSelector(selectSearchHasMore);
    const searchTerm = useAppSelector(selectSearchTerm);
    const page = useAppSelector(selectSearchPage);

    const scrollLoadingRef = useRef(false);

    // Load initial images on mount - but respect existing search state AND browsing state
    useEffect(() => {
        console.log('SearchPage mounting/remounting. Current state:', {
            searchTerm,
            searchTermTrimmed: searchTerm?.trim(),
            hasSearchTerm: !!(searchTerm && searchTerm.trim()),
            imagesCount: images.length,
            currentPage: page,
            hasMore
        });

        // If there's already a search term in Redux state, restore the search results
        if (searchTerm && searchTerm.trim()) {
            console.log('Restoring search results for:', searchTerm);
            dispatch(searchImagesRequest({ query: searchTerm }));
        } else if (images.length > 0 && page >= 1) {
            // We have existing browsing state - don't reload, just preserve what we have
            console.log('Preserving existing browsing state:', {
                imagesCount: images.length,
                page,
                hasMore
            });
            // Don't call loadImages() - we already have the data
        } else {
            // No existing search term and no existing images, load fresh
            console.log('No existing state, loading fresh images');
            dispatch(loadImagesRequest());
        }
        dispatch(loadHistoryRequest({ page: 1, pageSize: 100 }));
    }, []);

    // Update search term when external prop changes
    useEffect(() => {
        if (externalSearchTerm !== undefined && externalSearchTerm !== searchTerm) {
            dispatch(setSearchTerm(externalSearchTerm));
            if (externalSearchTerm.trim()) {
                dispatch(searchImagesRequest({ query: externalSearchTerm }));
            }
        }
    }, [externalSearchTerm, searchTerm, dispatch]);    // Handle load more
    const loadMore = useCallback(() => {
        // Only allow load more if we're not in search mode
        const isSearchMode = searchTerm && searchTerm.trim().length > 0;

        if (!loading && hasMore && !scrollLoadingRef.current && !isSearchMode) {
            scrollLoadingRef.current = true;
            dispatch(loadMoreImagesRequest());

            // Reset the scroll loading flag after a delay
            setTimeout(() => {
                scrollLoadingRef.current = false;
            }, 1000);
        }
    }, [loading, hasMore, searchTerm, dispatch]);

    // Infinite scroll handler
    const handleScroll = useCallback(() => {
        // Only allow infinite scroll if we're not in search mode
        const isSearchMode = searchTerm && searchTerm.trim().length > 0;

        if (scrollLoadingRef.current || !hasMore || loading || isSearchMode) {
            return;
        }

        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight;
        const clientHeight = document.documentElement.clientHeight;

        if (scrollTop + clientHeight >= scrollHeight - 100) {
            loadMore();
        }
    }, [loading, hasMore, loadMore, searchTerm]);

    useEffect(() => {
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [handleScroll]);

    // Handle reload
    const handleReload = useCallback(() => {
        dispatch(clearImages());
        dispatch(loadImagesRequest());
    }, [dispatch]);

    // Expose reload function to parent
    useEffect(() => {
        if (onReload) {
            (window as any).searchPageReload = handleReload;
        }
    }, [onReload, handleReload]);

    // Handle search from search bar
    const handleSearch = useCallback((searchQuery: string) => {
        if (searchQuery.trim()) {
            dispatch(setSearchTerm(searchQuery));
            dispatch(searchImagesRequest({ query: searchQuery }));

            // Save to search history after successful search
            // This will be handled by the saga when search is successful
        }
    }, [dispatch]);

    // Determine if a search has been performed
    const hasSearched = searchTerm && searchTerm.trim().length > 0;
    const hasResults = images.length > 0;
    const showNoResults = hasSearched && !hasResults && !loading && !error;
    const showResultsCount = hasSearched && hasResults && !loading;

    // Only show LoadMoreSection for browsing mode (not search mode)
    const shouldShowLoadMore = !hasSearched && hasResults && !error;

    // Debug logging
    console.log('SearchPage render state:', {
        searchTerm,
        hasSearched,
        hasResults,
        shouldShowLoadMore,
        hasMore,
        loading,
        error: !!error
    });

    return (
        <SearchPageContainer>
            {loading && images.length === 0 ? (
                <LoadingSpinner message={t('mainPage.loadingMessage')} />
            ) : (
                <>
                    {/* Show search results count */}
                    {showResultsCount && (
                        <SearchResultsInfo>
                            {t('searchPage.resultsCount', {
                                count: images.length,
                                query: searchTerm
                            })}
                        </SearchResultsInfo>
                    )}

                    {/* Show no results message */}
                    {showNoResults && (
                        <SearchResultsInfo>
                            {t('searchPage.noResults', { query: searchTerm })}
                        </SearchResultsInfo>
                    )}

                    {/* Show images if available */}
                    {images.length > 0 && <NasaImagesList nasaImages={images} />}

                    {/* Show error message */}
                    {!!error && images.length === 0 && (
                        <ErrorMessage message={error} />
                    )}

                    {/* Show load more section - only for browsing all images, not search results */}
                    {shouldShowLoadMore && (
                        <LoadMoreSection
                            loadingMore={loading}
                            hasMore={hasMore}
                            recordsCount={images.length}
                        />
                    )}

                    <ScrollSentinel />
                </>
            )}
        </SearchPageContainer>
    );
};
