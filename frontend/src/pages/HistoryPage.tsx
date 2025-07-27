import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { Button, Icon, LoadingSpinner } from '../components/common';
import { colors } from '../constants/colors';
import { sizes } from '../constants/sizes';
import { useReduxSearchHistory } from '../hooks/useReduxSearchHistory';

const HistoryContainer = styled.div`
  padding: ${sizes.padding.xl};
  color: ${colors.text.primary};
  flex: 1;
  overflow-y: auto;
  width: 100%;
  min-height: 0;
  max-width: 1000px; /* Limit overall width */
  margin: 0 auto; /* Center the container */
`;

const HistoryRecord = styled.div`
  background: rgba(255, 255, 255, 0.1);
  padding: ${sizes.padding.lg};
  border-radius: ${sizes.radius.lg};
  margin: ${sizes.margin.md} 0;
  width: 100%;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  display: grid;
  grid-template-columns: 400px 160px 120px auto;
  gap: ${sizes.spacing.md};
  align-items: center;
  
  &:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: translateY(-2px);
  }
`;

const SearchTitle = styled.h3`
  margin: 0;
  max-width: 400px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 1.2rem;
  font-weight: 600;
`;

const InfoText = styled.p`
  margin: 0;
  font-size: 0.9rem;
  color: ${colors.text.secondary};
`;

const RecordActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: ${sizes.spacing.sm};
  opacity: 0;
  transition: opacity 0.3s ease;
  
  ${HistoryRecord}:hover & {
    opacity: 1;
  }
`;

const ComingSoonMessage = styled.div`
  text-align: center;
  padding: ${sizes.padding.xl};
  color: ${colors.text.secondary};
  font-style: italic;
`;

export const HistoryPage: React.FC = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const {
        searchHistory,
        loading,
        error,
        loadSearchHistory,
        removeSearchTerm
    } = useReduxSearchHistory();

    // Helper function to format date and time
    const formatDateTime = (timestamp: number) => {
        const date = new Date(timestamp);
        const dateStr = date.toLocaleDateString();
        const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        return `${dateStr} ${timeStr}`;
    };

    // Load search history when component mounts
    useEffect(() => {
        loadSearchHistory();
    }, [loadSearchHistory]);

    const handleHistoryRecordClick = (historyId: string) => {
        navigate(`/history/${historyId}`);
    };

    const handleDeleteRecord = (e: React.MouseEvent, recordId: string) => {
        e.stopPropagation(); // Prevent record click when deleting

        // TODO: Add confirmation dialog
        const confirmDelete = window.confirm(t('historyPage.confirmDelete', 'Are you sure you want to delete this search history?'));

        if (confirmDelete) {
            // Use the record ID directly for deletion
            removeSearchTerm(recordId);
        }
    };

    if (loading) {
        return (
            <HistoryContainer>
                <LoadingSpinner />
            </HistoryContainer>
        );
    }

    if (error) {
        return (
            <HistoryContainer>
                <ComingSoonMessage>
                    Error loading search history: {error}
                </ComingSoonMessage>
            </HistoryContainer>
        );
    }

    return (
        <HistoryContainer>
            {searchHistory.length > 0 ? (
                searchHistory.map((record) => (
                    <HistoryRecord
                        key={record.id}
                        onClick={() => handleHistoryRecordClick(record.id)}
                    >
                        <div>
                            <SearchTitle title={`Search: "${record.query}"`}>
                                Search: "{record.query}"
                            </SearchTitle>
                        </div>
                        <div>
                            <InfoText>{formatDateTime(record.timestamp)}</InfoText>
                        </div>
                        <div>
                            <InfoText>{record.resultCount} images</InfoText>
                        </div>
                        <RecordActions>
                            <Button onClick={(e) => handleDeleteRecord(e, record.id)} title={t('historyPage.deleteRecord')}>
                                <Icon name="delete" />
                            </Button>
                        </RecordActions>
                    </HistoryRecord>
                ))
            ) : (
                <ComingSoonMessage>
                    {t('historyPage.noHistory', 'No search history yet. Start searching to see your history here!')}
                </ComingSoonMessage>
            )}
        </HistoryContainer>
    );
};
