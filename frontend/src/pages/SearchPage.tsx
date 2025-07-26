import React, { useEffect, useState, useCallback, useRef } from 'react';
import axios from 'axios';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { LoadingSpinner, ErrorMessage, LoadMoreSection } from '../components/common';
import { NasaImagesList } from '../components/NasaImagesList';
import { NasaImage } from '../components/types/NasaImage';
import { sizes } from '../constants/sizes';

const ScrollSentinel = styled.div`
  height: ${sizes.spacing.xl};
  margin: ${sizes.margin.md} 0;
`;

const ITEMS_PER_PAGE = 12;
const SEARCH_DEBOUNCE_DELAY = 500; // 500ms delay
const RETRY_DELAY = 3; // 3 seconds

export const SearchPage: React.FC = () => {
  const { t } = useTranslation();
  
  const [nasaImages, setNasaImages] = useState<NasaImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [allData, setAllData] = useState<NasaImage[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [retryCountdown, setRetryCountdown] = useState<number | null>(null);
  const [retryParams, setRetryParams] = useState<{ pageNum: number; append: boolean } | null>(null);
  
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isRetryingRef = useRef(false);

  // Cleanup retry timeout on unmount
  useEffect(() => {
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, []);

  // Retry countdown effect
  useEffect(() => {
    console.log('Countdown effect triggered:', { retryCountdown, retryParams: retryParams?.pageNum });
    
    if (retryCountdown === null || retryCountdown <= 0) {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
        retryTimeoutRef.current = null;
      }
      
      if (retryCountdown === 0 && retryParams && !isRetryingRef.current) {
        // Execute the retry
        console.log('Executing retry for page:', retryParams.pageNum);
        isRetryingRef.current = true;
        const params = retryParams;
        setRetryCountdown(null);
        setRetryParams(null);
        setError(null);
        
        setTimeout(() => {
          fetchNasaImages(params.pageNum, params.append);
          isRetryingRef.current = false;
        }, 100);
      }
      return;
    }

    // Set timer for next countdown
    retryTimeoutRef.current = setTimeout(() => {
      console.log('Countdown tick:', retryCountdown, '->', retryCountdown - 1);
      setRetryCountdown(prev => prev !== null && prev > 0 ? prev - 1 : null);
    }, 1000);

    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
        retryTimeoutRef.current = null;
      }
    };
  }, [retryCountdown]);

  const startRetry = useCallback((pageNum: number, append: boolean) => {
    // Prevent starting a new retry if one is already in progress
    if (isRetryingRef.current || retryCountdown !== null) {
      console.log('Retry blocked: already in progress', { isRetrying: isRetryingRef.current, countdown: retryCountdown });
      return;
    }
    
    console.log('Starting retry for page:', pageNum, 'append:', append);
    setRetryParams({ pageNum, append });
    setRetryCountdown(RETRY_DELAY);
  }, [retryCountdown, RETRY_DELAY]);

  const fetchAllData = async () => {
    try {
      const response = await axios.get('/api/sources');
      setAllData(response.data);
      return response.data;
    } catch (err) {
      setError(t('mainPage.errorMessage'));
      return [];
    }
  };

  const fetchNasaImages = async (pageNum: number = 1, append: boolean = false) => {
    if (pageNum === 1) {
      setLoading(true);
      setError(null);
    } else {
      setLoadingMore(true);
    }

    try {
      // Simulate network delay for better UX demonstration
      const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

      // Simulate server errors with 40% probability
      if (Math.random() < 0.4) {
        await delay(1000); // Still show loading for a bit before error
        throw new Error('Simulated server error');
      }

      let dataToUse = allData;
      if (allData.length === 0) {
        dataToUse = await fetchAllData();
      }

      // Add 1 second delay to simulate slower network
      await delay(1000);

      // Calculate pagination
      const startIndex = (pageNum - 1) * ITEMS_PER_PAGE;
      const endIndex = startIndex + ITEMS_PER_PAGE;
      const paginatedData = dataToUse.slice(startIndex, endIndex);

      // Check if there are more items
      const hasMoreItems = endIndex < dataToUse.length;
      setHasMore(hasMoreItems);

      if (append) {
        setNasaImages(prev => [...prev, ...paginatedData]);
      } else {
        setNasaImages(paginatedData);
      }
    } catch (err) {
      // Start retry countdown without setting error message here
      // The error message will be handled by the render logic
      startRetry(pageNum, append);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMore = useCallback(() => {
    if (retryCountdown !== null || isRetryingRef.current) {
      console.log('LoadMore blocked: retry in progress', { countdown: retryCountdown, isRetrying: isRetryingRef.current });
      return;
    }
    
    if (!loadingMore && hasMore) {
      console.log('LoadMore executing for page:', page + 1);
      const nextPage = page + 1;
      setPage(nextPage);
      fetchNasaImages(nextPage, true);
    }
  }, [loadingMore, hasMore, page, retryCountdown]);

  // Infinite scroll detection
  const handleScroll = useCallback(() => {
    if (loadingMore || !hasMore || retryCountdown !== null || isRetryingRef.current) {
      if (retryCountdown !== null || isRetryingRef.current) {
        console.log('Scroll blocked: retry in progress', { countdown: retryCountdown, isRetrying: isRetryingRef.current });
      }
      return;
    }

    const scrollTop = document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight;
    const clientHeight = document.documentElement.clientHeight;

    if (scrollTop + clientHeight >= scrollHeight - 100) {
      console.log('Scroll triggered loadMore');
      loadMore();
    }
  }, [loadingMore, hasMore, retryCountdown, loadMore]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  useEffect(() => {
    fetchNasaImages(1);
  }, []);

  const handleReload = () => {
    // Clear retry state if user manually reloads
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }
    isRetryingRef.current = false;
    setRetryCountdown(null);
    setRetryParams(null);
    setPage(1);
    setHasMore(true);
    fetchNasaImages(1);
    setAllData([]); // Reset all data to refetch from API
    setNasaImages([]); // Clear current images to refetch
  };

  const handleSearch = (searchTerm: string) => {
    setSearchTerm(searchTerm);
  };

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, SEARCH_DEBOUNCE_DELAY);

    return () => clearTimeout(timer);
  }, [searchTerm, SEARCH_DEBOUNCE_DELAY]);

  // Handle the actual search when debounced term changes
  useEffect(() => {
    if (debouncedSearchTerm !== '') {
      // TODO: Implement actual search functionality here
      console.log('Executing search for:', debouncedSearchTerm);
      // Future: API call to search backend
      // Example: searchImages(debouncedSearchTerm);
    }
  }, [debouncedSearchTerm]);

  return (
    <>
      {loading && nasaImages.length === 0 ? (
        <LoadingSpinner message={t('mainPage.loadingMessage')} />
      ) : (
        <>
          {nasaImages.length > 0 && <NasaImagesList nasaImages={nasaImages} />}

          {retryCountdown !== null && retryParams && (
            <ErrorMessage message={t(
              retryParams.pageNum === 1 ? 'mainPage.retryingIn' : 'mainPage.retryingLoadMore',
              { seconds: retryCountdown }
            )} />
          )}

          {!!error && retryCountdown === null && nasaImages.length === 0 && (
            <ErrorMessage message={error} />
          )}

          {nasaImages.length > 0 && retryCountdown === null && !error && (
            <LoadMoreSection
              loadingMore={loadingMore}
              hasMore={hasMore}
              recordsCount={nasaImages.length}
            />
          )}

          <ScrollSentinel />
        </>
      )}
    </>
  );
};
