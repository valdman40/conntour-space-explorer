import React from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { LoadingSpinner } from './LoadingSpinner';
import { sizes } from '../../constants/sizes';

interface LoadMoreSectionProps {
  loadingMore: boolean;
  hasMore: boolean;
  recordsCount: number;
}

const LoadMoreContainer = styled.div`
  margin: ${sizes.margin.xl} 0;
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
`;

const AllLoadedText = styled.p`
  opacity: 0.7;
  margin: 0;
`;

export const LoadMoreSection: React.FC<LoadMoreSectionProps> = ({
  loadingMore,
  hasMore,
  recordsCount
}) => {
  const { t } = useTranslation();

  // Don't render anything if there are no records
  if (recordsCount === 0) {
    return null;
  }

  return (
    <LoadMoreContainer>
      {loadingMore && (
        <LoadingSpinner message={t('mainPage.loadingMore')} />
      )}

      {!hasMore && recordsCount > 0 && (
        <AllLoadedText>{t('mainPage.allLoaded')}</AllLoadedText>
      )}
    </LoadMoreContainer>
  );
};
