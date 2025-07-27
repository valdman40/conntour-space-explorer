import React, { useMemo, useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { NasaImageCard } from './NasaImageCard';
import { NasaImage } from './types/NasaImage';

interface NasaImagesListProps {
  nasaImages: NasaImage[];
}

const VirtualizedContainer = styled.div`
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  /* Remove fixed height to allow natural page scrolling */
`;

const VirtualGrid = styled.div<{ totalHeight: number }>`
  position: relative;
  height: ${props => props.totalHeight}px;
  width: 100%;
`;

const VisibleRow = styled.div<{ top: number; columnsCount: number }>`
  position: absolute;
  top: ${props => props.top}px;
  left: 0;
  right: 0;
  display: grid;
  grid-template-columns: repeat(${props => props.columnsCount}, 1fr);
  gap: 2rem;
  padding: 0 1rem;
  justify-content: center;
  max-width: 1200px;
  margin: 0 auto;
`;

export const NasaImagesList: React.FC<NasaImagesListProps> = ({ nasaImages }) => {
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 0 });
  const [containerWidth, setContainerWidth] = useState(1200);

  // Grid configuration
  const ITEM_HEIGHT = 650; // Estimated height per row
  const BUFFER_SIZE = 2; // Number of rows to render outside viewport

  // Calculate grid layout
  const { itemsPerRow, totalRows } = useMemo(() => {
    const minCardWidth = 350;
    const gap = 32;
    const padding = 32;
    const availableWidth = containerWidth - padding;
    const cols = Math.max(1, Math.floor((availableWidth + gap) / (minCardWidth + gap)));
    const rows = Math.ceil(nasaImages.length / cols);
    
    return {
      itemsPerRow: cols,
      totalRows: rows
    };
  }, [containerWidth, nasaImages.length]);

  // Calculate visible rows based on scroll position
  const updateVisibleRange = useCallback(() => {
    const scrollTop = window.pageYOffset;
    const viewportHeight = window.innerHeight;
    
    const startRow = Math.max(0, Math.floor(scrollTop / ITEM_HEIGHT) - BUFFER_SIZE);
    const endRow = Math.min(totalRows - 1, Math.ceil((scrollTop + viewportHeight) / ITEM_HEIGHT) + BUFFER_SIZE);
    
    setVisibleRange({ start: startRow, end: endRow });
  }, [totalRows, ITEM_HEIGHT]);

  // Handle resize
  const handleResize = useCallback(() => {
    const container = document.querySelector('[data-testid="virtualized-container"]');
    if (container) {
      setContainerWidth(container.getBoundingClientRect().width);
    }
    updateVisibleRange();
  }, [updateVisibleRange]);

  // Set up scroll and resize listeners
  useEffect(() => {
    updateVisibleRange();
    handleResize();

    const handleScroll = () => updateVisibleRange();
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, [updateVisibleRange, handleResize]);

  // Fallback for small lists
  if (nasaImages.length < 20) {
    return (
      <VirtualizedContainer data-testid="virtualized-container">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
          gap: '2rem',
          padding: '0 1rem'
        }}>
          {nasaImages.map((nasaImage) => (
            <NasaImageCard key={nasaImage.id} nasaImage={nasaImage} />
          ))}
        </div>
      </VirtualizedContainer>
    );
  }

  // Render visible rows
  const visibleRows = [];
  for (let rowIndex = visibleRange.start; rowIndex <= visibleRange.end; rowIndex++) {
    const startItemIndex = rowIndex * itemsPerRow;
    const endItemIndex = Math.min(startItemIndex + itemsPerRow, nasaImages.length);
    const rowItems = nasaImages.slice(startItemIndex, endItemIndex);
    
    if (rowItems.length > 0) {
      visibleRows.push(
        <VisibleRow key={rowIndex} top={rowIndex * ITEM_HEIGHT} columnsCount={itemsPerRow}>
          {rowItems.map((nasaImage) => (
            <NasaImageCard key={nasaImage.id} nasaImage={nasaImage} />
          ))}
        </VisibleRow>
      );
    }
  }

  return (
    <VirtualizedContainer data-testid="virtualized-container">
      <VirtualGrid totalHeight={totalRows * ITEM_HEIGHT}>
        {visibleRows}
      </VirtualGrid>
    </VirtualizedContainer>
  );
};
