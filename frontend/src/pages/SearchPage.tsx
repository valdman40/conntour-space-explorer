import React, { useEffect, useCallback, useRef, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { useTranslation } from 'react-i18next';
import {
    LoadingSpinner,
    ErrorMessage,
    LoadMoreSection
} from '../components/common';
import { useAppSelector, useAppDispatch } from '../redux/store';
import {
    selectSearchImages,
    selectSearchLoading,
    selectSearchError,
    selectSearchHasMore,
    selectSearchPage,
    selectSearchTotalItems,
} from '../redux/modules/search/selectors';
import { SearchBar } from '../components/common/SearchBar';
import { NasaImagesList } from '../components/NasaImagesList';
import {
    loadImagesRequest,
    loadMoreImagesRequest,
    searchImagesDebounced,
    loadMoreSearchResultsRequest
} from '../redux/modules/search/reducer';
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

const SearchBarWrapper = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  margin-bottom: ${sizes.margin.lg};
  padding: 0 ${sizes.padding.md};
`;

interface SearchPageProps {
    searchTerm?: string;
}

export const SearchPage: React.FC<SearchPageProps> = ({ searchTerm: externalSearchTerm }) => {
    const { t } = useTranslation();
    const dispatch = useAppDispatch();

    // Local search input state
    const [searchInput, setSearchInput] = useState('');

    // Redux selectors
    const images = useAppSelector(selectSearchImages);
    const loading = useAppSelector(selectSearchLoading);
    const error = useAppSelector(selectSearchError);
    const hasMore = useAppSelector(selectSearchHasMore);
    const page = useAppSelector(selectSearchPage);
    const totalItems = useAppSelector(selectSearchTotalItems);

    const scrollLoadingRef = useRef(false);

    useEffect(() => {
        dispatch(loadImagesRequest())
    },[]);

    // Handle search input changes and trigger debounced search
    const handleSearch = useCallback((query: string) => {
        setSearchInput(query);
        dispatch(searchImagesDebounced({ query }));
    }, [dispatch]);


    const loadMore = useCallback(() => {
        if (!loading && hasMore && !scrollLoadingRef.current) {
            scrollLoadingRef.current = true;
            const nextPage = page + 1;
            
            if (searchInput && searchInput.trim()) {
                // Load more search results (without creating history)
                dispatch(loadMoreSearchResultsRequest({ 
                    query: searchInput.trim(), 
                    page: nextPage, 
                    pageSize: 20 
                }));
            } else {
                // Load more browse results
                dispatch(loadMoreImagesRequest({ page: nextPage, pageSize: 20 }));
            }

            // Reset the scroll loading flag after a delay
            setTimeout(() => {
                scrollLoadingRef.current = false;
            }, 1000);
        }
    }, [loading, hasMore, searchInput, page, dispatch]);

    // Infinite scroll handler
    const handleScroll = useCallback(() => {
        if (scrollLoadingRef.current || !hasMore || loading) {
            return;
        }

        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight;
        const clientHeight = document.documentElement.clientHeight;

        if (scrollTop + clientHeight >= scrollHeight - 100) {
            loadMore();
        }
    }, [loading, hasMore, loadMore]);

    useEffect(() => {
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [handleScroll])

    // Determine if a search has been performed
    const hasSearched = searchInput && searchInput.trim().length > 0;
    const hasResults = images.length > 0;
    const showNoResults = hasSearched && !hasResults && !loading && !error;
    const showResultsCount = hasSearched && hasResults && !loading;

    // Show LoadMoreSection for both browsing and search modes
    const shouldShowLoadMore = hasResults && !error;

    return (
        <SearchPageContainer>
            {/* Search Bar */}
            <SearchBarWrapper>
                <SearchBar
                    onSearch={handleSearch}
                    placeholder={t('mainPage.searchPlaceholder')}
                    value={searchInput}
                    isVisible={true}
                />
            </SearchBarWrapper>

            {loading && images.length === 0 ? (
                <LoadingSpinner message={t('mainPage.loadingMessage')} />
            ) : (
                <>
                    {/* Show search results count */}
                    {showResultsCount && (
                        <SearchResultsInfo>
                            {t('searchPage.resultsCount', {
                                count: totalItems || images.length,
                                query: searchInput
                            })}
                        </SearchResultsInfo>
                    )}

                    {/* Show no results message */}
                    {showNoResults && (
                        <SearchResultsInfo>
                            {t('searchPage.noResults', { query: searchInput })}
                        </SearchResultsInfo>
                    )}

                    {/* Show images if available */}
                    {images.length > 0 && <NasaImagesList nasaImages={images} />}

                    {/* Show error message */}
                    {!!error && images.length === 0 && (
                        <ErrorMessage message={error} />
                    )}

                    {/* Show load more section for both browsing and search results */}
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
