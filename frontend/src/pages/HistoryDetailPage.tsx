import React from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { colors } from '../constants/colors';
import { sizes } from '../constants/sizes';
import { useReduxSearchHistory } from '../hooks/useReduxSearchHistory';
import { NasaImagesList } from '../components/NasaImagesList';
import { LoadingSpinner, ErrorMessage } from '../components/common';

const HistoryDetailContainer = styled.div`
  padding: ${sizes.padding.xl};
  color: ${colors.text.primary};
  flex: 1;
  overflow-y: auto;
  width: 100%;
  min-height: 0;
  max-width: 1000px;
  margin: 0 auto;
`;

const HistoryRecord = styled.div`
  background: rgba(255, 255, 255, 0.1);
  padding: ${sizes.padding.lg};
  border-radius: ${sizes.radius.lg};
  margin: ${sizes.margin.lg} 0;
`;

const SearchInfo = styled.div`
  margin-bottom: ${sizes.margin.lg};
`;

const SearchTerm = styled.h2`
  color: ${colors.text.primary};
  margin-bottom: ${sizes.margin.md};
`;

const SearchMeta = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${sizes.spacing.md};
  margin-bottom: ${sizes.margin.lg};
  
  p {
    margin: ${sizes.margin.xs} 0;
    color: ${colors.text.secondary};
  }
`;

const ResultsSection = styled.div`
  margin-top: ${sizes.margin.xl};
`;

export const HistoryDetailPage: React.FC = () => {
  const { historyId } = useParams<{ historyId: string }>();
  const { t } = useTranslation();
  const { searchHistory, loading, error } = useReduxSearchHistory();

  // Find the specific history item by ID
  const historyItem = searchHistory.find(item => item.id === historyId);

  // If we don't have the history item and not loading, it might not exist
  if (!loading && !historyItem) {
    return (
      <HistoryDetailContainer>
        <ErrorMessage message={t('historyDetailPage.notFound', 'History item not found')} />
      </HistoryDetailContainer>
    );
  }

  // Show loading while fetching data
  if (loading && !historyItem) {
    return (
      <HistoryDetailContainer>
        <LoadingSpinner message={t('common.loading')} />
      </HistoryDetailContainer>
    );
  }

  // Show error if there's an error
  if (error) {
    return (
      <HistoryDetailContainer>
        <ErrorMessage message={error} />
      </HistoryDetailContainer>
    );
  }

  // If we have the history item, display it
  if (!historyItem) {
    return null;
  }

  return (
    <HistoryDetailContainer>
      <HistoryRecord>
        <SearchInfo>
          <SearchTerm>"{historyItem.query}"</SearchTerm>
          <SearchMeta>
            <p><strong>{t('historyDetailPage.date', 'Date:')}</strong> {new Date(historyItem.timestamp).toLocaleString()}</p>
          </SearchMeta>
        </SearchInfo>

        {historyItem.results && historyItem.results.length > 0 && (
          <ResultsSection>
            <h3>{t('historyDetailPage.searchResults', 'Search Results')} ({historyItem.resultCount})</h3>
            <NasaImagesList nasaImages={historyItem.results} />
          </ResultsSection>
        )}
      </HistoryRecord>
    </HistoryDetailContainer>
  );
};
