import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import styled, { keyframes } from 'styled-components';
import { Button, Icon, LoadingSpinner } from '../components/common';
import { colors } from '../constants/colors';
import { sizes } from '../constants/sizes';
import { useReduxSearchHistory } from '../hooks/useReduxSearchHistory';

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

const HistoryContainer = styled.div`
  padding: ${sizes.padding.xl};
  color: ${colors.text.primary};
  flex: 1;
  overflow-y: auto;
  width: 100%;
  min-height: 0;
  max-width: 1000px; /* Limit overall width */
  margin: 0 auto; /* Center the container */
  display: flex;
  flex-direction: column;
  animation: ${fadeIn} 0.3s ease-in-out;
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

const PaginationContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: ${sizes.margin.md};
  margin-top: ${sizes.margin.xl};
  padding: ${sizes.padding.lg};
`;

const PaginationButton = styled(Button)<{ disabled?: boolean }>`
  opacity: ${props => props.disabled ? 0.5 : 1};
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  
  &:hover {
    opacity: ${props => props.disabled ? 0.5 : 0.8};
  }
`;

const PageInfo = styled.span`
  color: ${colors.text.secondary};
  font-size: ${sizes.fontSize.sm};
  margin: 0 ${sizes.margin.md};
`;

const HistoryContent = styled.div`
  flex: 1;
`;

const HistoryHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${sizes.margin.lg};
  padding-bottom: ${sizes.padding.md};
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const TotalCounter = styled.div`
  color: ${colors.text.secondary};
  font-size: ${sizes.fontSize.sm};
  font-weight: 600;
`;

const HeaderTopSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  margin-bottom: ${sizes.margin.md};
`;

const ClearAllButton = styled(Button)`
  background: rgba(255, 99, 99, 0.2);
  border: 1px solid rgba(255, 99, 99, 0.3);
  color: ${colors.text.primary};
  font-size: ${sizes.fontSize.sm};
  padding: ${sizes.padding.sm} ${sizes.padding.md};
  
  &:hover {
    background: rgba(255, 99, 99, 0.3);
    border-color: rgba(255, 99, 99, 0.5);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

// Styled component for error message
const ErrorMessage = styled.div`
    text-align: center;
    color: ${colors.text.secondary};
    font-size: 1.1rem;
    padding: 2rem;
    font-style: italic;
`;

export const HistoryPage: React.FC = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const {
        searchHistory,
        loading,
        error,
        pagination,
        loadSearchHistory,
        removeSearchTerm,
        clearSearchHistory
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
        loadSearchHistory(1, 100); // Load first page with 100 items
    }, [loadSearchHistory]);

    const handlePageChange = (newPage: number) => {
        loadSearchHistory(newPage, pagination.pageSize);
    };

    const handleHistoryRecordClick = (historyId: string) => {
        navigate(`/history/${historyId}`);
    };

    const handleDeleteRecord = (e: React.MouseEvent, recordId: string) => {
        e.stopPropagation(); // Prevent record click when deleting

        const confirmDelete = window.confirm(t('historyPage.confirmDelete'));

        if (confirmDelete) {
            // Use the record ID directly for deletion
            removeSearchTerm(recordId);
        }
    };

    const handleClearAll = () => {
        const confirmClearAll = window.confirm(t('historyPage.confirmClearAll'));
        
        if (confirmClearAll) {
            clearSearchHistory();
        }
    };

    if (loading && !searchHistory.length) {
        return (
            <HistoryContainer>
                <LoadingSpinner />
            </HistoryContainer>
        );
    }

    if (error) {
        return (
            <HistoryContainer>
                <ErrorMessage>
                    {t('historyPage.errorLoading')} {error}
                </ErrorMessage>
            </HistoryContainer>
        );
    }

    return (
        <HistoryContainer>
            <HistoryHeader>
                <HeaderTopSection>
                    <TotalCounter>
                        {pagination.totalItems > 0 
                            ? t('historyPage.totalItems', { 
                                count: pagination.totalItems
                              })
                            : t('historyPage.noItems', 'No items')
                        }
                    </TotalCounter>
                    
                    {pagination.totalItems > 0 && (
                        <ClearAllButton 
                            onClick={handleClearAll}
                            disabled={loading}
                        >
                            {t('historyPage.clearAll')}
                        </ClearAllButton>
                    )}
                </HeaderTopSection>
                
                {/* Pagination Controls at the top */}
                {pagination.totalPages > 1 && (
                    <PaginationContainer style={{ margin: 0, padding: 0 }}>
                        <PaginationButton
                            disabled={!pagination.hasPrevious}
                            onClick={() => handlePageChange(pagination.page - 1)}
                            title={t('historyPage.previousPage', 'Previous Page')}
                        >
                            <Icon name="arrow_back" />
                        </PaginationButton>
                        
                        <PageInfo>
                            {t('historyPage.pageInfo', {
                                current: pagination.page,
                                total: pagination.totalPages,
                                defaultValue: `Page ${pagination.page} of ${pagination.totalPages}`
                            })}
                        </PageInfo>
                        
                        <PaginationButton
                            disabled={!pagination.hasNext}
                            onClick={() => handlePageChange(pagination.page + 1)}
                            title={t('historyPage.nextPage', 'Next Page')}
                        >
                            <Icon name="arrow_forward" />
                        </PaginationButton>
                    </PaginationContainer>
                )}
            </HistoryHeader>
            
            <HistoryContent>
                {searchHistory.length > 0 ? (
                    searchHistory.map((record) => (
                        <HistoryRecord
                            key={record.id}
                            onClick={() => handleHistoryRecordClick(record.id)}
                        >
                            <div>
                                <SearchTitle title={`"${record.query}"`}>
                                    "{record.query}"
                                </SearchTitle>
                            </div>
                            <div>
                                <InfoText>{formatDateTime(record.timestamp)}</InfoText>
                            </div>
                            <div>
                                <InfoText>{record.resultCount} {t('historyPage.imagesLabel')}</InfoText>
                            </div>
                            <RecordActions>
                                <Button onClick={(e) => handleDeleteRecord(e, record.id)} title={t('historyPage.deleteRecord')}>
                                    <Icon name="delete" />
                                </Button>
                            </RecordActions>
                        </HistoryRecord>
                    ))
                ) : (
                    <div style={{ 
                        textAlign: 'center', 
                        padding: '2rem', 
                        color: '#888', 
                        fontStyle: 'italic' 
                    }}>
                        {t('historyPage.noHistory')}
                    </div>
                )}
            </HistoryContent>
            
            {/* Bottom Pagination Controls (optional - can be removed if not needed) */}
            {pagination.totalPages > 1 && (
                <PaginationContainer>
                    <PaginationButton
                        disabled={!pagination.hasPrevious}
                        onClick={() => handlePageChange(pagination.page - 1)}
                        title={t('historyPage.previousPage', 'Previous Page')}
                    >
                        <Icon name="arrow_back" />
                    </PaginationButton>
                    
                    <PageInfo>
                        {t('historyPage.pageInfo', {
                            current: pagination.page,
                            total: pagination.totalPages,
                            defaultValue: `Page ${pagination.page} of ${pagination.totalPages}`
                        })}
                    </PageInfo>
                    
                    <PaginationButton
                        disabled={!pagination.hasNext}
                        onClick={() => handlePageChange(pagination.page + 1)}
                        title={t('historyPage.nextPage', 'Next Page')}
                    >
                        <Icon name="arrow_forward" />
                    </PaginationButton>
                </PaginationContainer>
            )}
        </HistoryContainer>
    );
};
