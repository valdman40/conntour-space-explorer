import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { Button, Icon } from '../components/common';
import { colors } from '../constants/colors';
import { sizes } from '../constants/sizes';

const HistoryContainer = styled.div`
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
  margin: ${sizes.margin.md} 0;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  display: flex;
  flex-direction: column;
  gap: ${sizes.spacing.sm};
  
  &:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: translateY(-2px);
  }
`;

const RecordContent = styled.div`
  flex: 1;
  pointer-events: none; /* Prevent content from interfering with click */
`;

const RecordActions = styled.div`
  position: absolute;
  top: ${sizes.padding.md};
  right: ${sizes.padding.md};
  display: flex;
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

    // Mock history data - TODO: Replace with actual data from API/storage
    const initialHistory = [
        { id: '1', searchTerm: 'mars rover', timestamp: '2024-01-15T10:30:00Z', resultsCount: 24 },
        { id: '2', searchTerm: 'saturn rings', timestamp: '2024-01-14T15:45:00Z', resultsCount: 18 },
        { id: '3', searchTerm: 'apollo mission', timestamp: '2024-01-13T09:20:00Z', resultsCount: 32 },
    ];

    const [historyRecords, setHistoryRecords] = useState(initialHistory);

    const handleBackToSearch = () => {
        navigate('/search');
    };

    const handleHistoryRecordClick = (historyId: string) => {
        navigate(`/history/${historyId}`);
    };

    const handleDeleteRecord = (e: React.MouseEvent, recordId: string) => {
        e.stopPropagation(); // Prevent record click when deleting

        // TODO: Add confirmation dialog
        const confirmDelete = window.confirm(t('historyPage.confirmDelete', 'Are you sure you want to delete this search history?'));

        if (confirmDelete) {
            setHistoryRecords(prev => prev.filter(record => record.id !== recordId));
            // TODO: Also delete from API/storage
        }
    };

    return (
        <HistoryContainer>
            {historyRecords.length > 0 ? (
                historyRecords.map((record) => (
                    <HistoryRecord
                        key={record.id}
                        onClick={() => handleHistoryRecordClick(record.id)}
                    >
                        <RecordContent>
                            <h3>Search: "{record.searchTerm}"</h3>
                            <p>Date: {new Date(record.timestamp).toLocaleDateString()}</p>
                            <p>Results: {record.resultsCount} images found</p>
                        </RecordContent>
                        <RecordActions>
                            <Button onClick={(e) => handleDeleteRecord(e, record.id)} title={t('historyPage.deleteRecord')}>
                                <Icon name="delete" />
                            </Button>
                        </RecordActions>
                    </HistoryRecord>
                ))
            ) : (
                <ComingSoonMessage>
                    {t('historyPage.comingSoon')}
                </ComingSoonMessage>
            )}
        </HistoryContainer>
    );
};
