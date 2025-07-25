import React, { useEffect, useState } from 'react';
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

const MainPage: React.FC = () => {
  const { t } = useTranslation();
  const [nasaImages, setNasaImages] = useState<NasaImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNasaImages = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate network delay for better UX demonstration
      const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
      
      const response = await axios.get('/api/sources');
      
      // Add 3 second delay to simulate slower network
      await delay(3000);
      
      setNasaImages(response.data);
    } catch (err) {
      setError(t('mainPage.errorMessage'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNasaImages();
  }, []);

  const handleReload = () => {
    fetchNasaImages();
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
    </Container>
  );
};

export default MainPage; 