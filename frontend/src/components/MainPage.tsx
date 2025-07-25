import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { Container, PageHeader, LoadingSpinner, ErrorMessage, Button } from './common';
import { NasaImagesList } from './NasaImagesList';
import { NasaImage } from './types/NasaImage';

const ReloadButtonWrapper = styled.div`
  margin: 2rem 0;
  text-align: center;
`;

const LoadMoreWrapper = styled.div`
  margin: 2rem 0;
  text-align: center;
`;

const ScrollSentinel = styled.div`
  height: 20px;
  margin: 1rem 0;
`;

const MainPage: React.FC = () => {
  const { t } = useTranslation();
  const [nasaImages, setNasaImages] = useState<NasaImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [allData, setAllData] = useState<NasaImage[]>([]);

  const ITEMS_PER_PAGE = 12;

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
      setError(t('mainPage.errorMessage'));
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMore = () => {
    if (!loadingMore && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchNasaImages(nextPage, true);
    }
  };

  // Infinite scroll detection
  const handleScroll = useCallback(() => {
    if (loadingMore || !hasMore) return;

    const scrollTop = document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight;
    const clientHeight = document.documentElement.clientHeight;

    if (scrollTop + clientHeight >= scrollHeight - 100) {
      loadMore();
    }
  }, [loadingMore, hasMore, page]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  useEffect(() => {
    fetchNasaImages(1);
  }, []);

  const handleReload = () => {
    setPage(1);
    setHasMore(true);
    fetchNasaImages(1);
  };

  if (loading) {
    return (
      <Container>
        <LoadingSpinner message={t('mainPage.loadingMessage')} />
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <ErrorMessage message={error} />
      </Container>
    );
  }

  return (
    <Container>
      <PageHeader 
        title={t('mainPage.title')} 
        subtitle={t('mainPage.subtitle')} 
      />
      <ReloadButtonWrapper>
        <Button onClick={handleReload} disabled={loading}>
          {loading ? t('common.loading') : t('common.reload')}
        </Button>
      </ReloadButtonWrapper>
      <NasaImagesList nasaImages={nasaImages} />
      
      {loadingMore && (
        <LoadMoreWrapper>
          <LoadingSpinner message={t('mainPage.loadingMore')} />
        </LoadMoreWrapper>
      )}
      
      {!loading && hasMore && !loadingMore && (
        <LoadMoreWrapper>
          <Button onClick={loadMore}>
            {t('mainPage.loadMore')}
          </Button>
        </LoadMoreWrapper>
      )}
      
      {!hasMore && nasaImages.length > 0 && (
        <LoadMoreWrapper>
          <p style={{ opacity: 0.7 }}>{t('mainPage.allLoaded')}</p>
        </LoadMoreWrapper>
      )}
      
      <ScrollSentinel />
    </Container>
  );
};

export default MainPage; 