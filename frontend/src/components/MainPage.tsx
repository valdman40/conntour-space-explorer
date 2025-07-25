import React, { useEffect, useState } from 'react';
import axios from 'axios';
import styled from 'styled-components';
import { Container, PageHeader, LoadingSpinner, ErrorMessage, Button } from './common';
import { NasaImagesList } from './NasaImagesList';
import { NasaImage } from './types/NasaImage';

const ReloadButtonWrapper = styled.div`
  margin: 2rem 0;
  text-align: center;
`;

const MainPage: React.FC = () => {
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
      setError('Failed to fetch NASA images. Please try again later.');
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
        <LoadingSpinner message="Loading NASA images..." />
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
        title="NASA Space Images" 
        subtitle="Discover amazing space exploration images and datasets" 
      />
      <ReloadButtonWrapper>
        <Button onClick={handleReload} disabled={loading}>
          {loading ? 'Loading...' : 'Reload Images'}
        </Button>
      </ReloadButtonWrapper>
      <NasaImagesList nasaImages={nasaImages} />
    </Container>
  );
};

export default MainPage; 