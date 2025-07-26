import React from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { colors } from '../constants/colors';
import { sizes } from '../constants/sizes';

interface HistoryDetailPageProps {}

const HistoryDetailContainer = styled.div`
  padding: ${sizes.padding.xl};
  color: ${colors.text.primary};
  flex: 1;
  overflow-y: auto;
  width: 100%;
  min-height: 0;
`;

const HistoryRecord = styled.div`
  background: rgba(255, 255, 255, 0.1);
  padding: ${sizes.padding.lg};
  border-radius: ${sizes.radius.lg};
  margin: ${sizes.margin.lg} 0;
`;

export const HistoryDetailPage: React.FC<HistoryDetailPageProps> = () => {
  const { historyId } = useParams<{ historyId: string }>();
  const { t } = useTranslation();

  // TODO: Fetch actual history record by ID
  const mockHistoryRecord = {
    id: historyId,
    searchTerm: 'mars rover',
    timestamp: new Date().toISOString(),
    resultsCount: 24
  };

  return (
    <HistoryDetailContainer>
      <HistoryRecord>
        <h3>Search Record #{historyId}</h3>
        <p><strong>Search Term:</strong> {mockHistoryRecord.searchTerm}</p>
        <p><strong>Date:</strong> {new Date(mockHistoryRecord.timestamp).toLocaleDateString()}</p>
        <p><strong>Results Found:</strong> {mockHistoryRecord.resultsCount}</p>
      </HistoryRecord>
      
      {/* TODO: Display actual search results from this history record */}
      <p>{t('historyDetailPage.comingSoon')}</p>
    </HistoryDetailContainer>
  );
};
