import React, { useEffect, useCallback, useRef } from 'react';
import styled, { keyframes } from 'styled-components';
import { useTranslation } from 'react-i18next';
import {
    LoadingSpinner,
    ErrorMessage,
    LoadMoreSection
} from '../components/common';
import { NasaImagesList } from '../components/NasaImagesList';
import { useReduxImages } from '../hooks/useReduxImages';
import { useReduxSearchHistory } from '../hooks/useReduxSearchHistory';
import { NasaImage } from '../types';
import { sizes } from '../constants/sizes';

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
`;

const ScrollSentinel = styled.div`
  height: ${sizes.spacing.xl};
  margin: ${sizes.margin.md} 0;
`;

interface SearchPageProps {
    onReload?: () => void;
    searchTerm?: string;
}

export const SearchPage: React.FC<SearchPageProps> = ({ onReload, searchTerm: externalSearchTerm }) => {
    const { t } = useTranslation();
    
    // Redux hooks
    const {
        images,
        loading,
        error,
        hasMore,
        searchTerm,
        loadImages,
        loadMoreImages,
        searchImages,
        clearImages,
        setSearchTerm
    } = useReduxImages();
    
    const {
        addSearchTerm,
        loadSearchHistory
    } = useReduxSearchHistory();

    const scrollLoadingRef = useRef(false);

    // Load initial images on mount
    useEffect(() => {
        loadImages();
        loadSearchHistory();
    }, [loadImages, loadSearchHistory]);

    // Update search term when external prop changes
    useEffect(() => {
        if (externalSearchTerm !== undefined && externalSearchTerm !== searchTerm) {
            setSearchTerm(externalSearchTerm);
            if (externalSearchTerm.trim()) {
                searchImages(externalSearchTerm);
            }
        }
    }, [externalSearchTerm, searchTerm, setSearchTerm, searchImages]);

    // Handle load more
    const loadMore = useCallback(() => {
        if (!loading && hasMore && !scrollLoadingRef.current) {
            scrollLoadingRef.current = true;
            loadMoreImages();
            
            // Reset the scroll loading flag after a delay
            setTimeout(() => {
                scrollLoadingRef.current = false;
            }, 1000);
        }
    }, [loading, hasMore, loadMoreImages]);

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
    }, [handleScroll]);

    // Handle reload
    const handleReload = useCallback(() => {
        clearImages();
        loadImages();
    }, [clearImages, loadImages]);

    // Expose reload function to parent
    useEffect(() => {
        if (onReload) {
            (window as any).searchPageReload = handleReload;
        }
    }, [onReload, handleReload]);

    // Handle search from search bar
    const handleSearch = useCallback((searchQuery: string) => {
        if (searchQuery.trim()) {
            setSearchTerm(searchQuery);
            searchImages(searchQuery);
            
            // Save to search history after successful search
            // This will be handled by the saga when search is successful
        }
    }, [setSearchTerm, searchImages]);

    return (
        <SearchPageContainer>
            {loading && images.length === 0 ? (
                <LoadingSpinner message={t('mainPage.loadingMessage')} />
            ) : (
                <>
                    {images.length > 0 && <NasaImagesList nasaImages={images} />}

                    {!!error && images.length === 0 && (
                        <ErrorMessage message={error} />
                    )}

                    {images.length > 0 && !error && (
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
