import React from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { colors } from '../constants/colors';
import { sizes } from '../constants/sizes';

const HistoryContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  height: 400px;
  text-align: center;
  color: ${colors.text.secondary};
  padding: ${sizes.padding.xl};
`;

const HistoryTitle = styled.h2`
  font-size: ${sizes.fontSize['3xl']};
  color: ${colors.text.primary};
  margin-bottom: ${sizes.margin.lg};
`;

const HistoryMessage = styled.p`
  font-size: ${sizes.fontSize.lg};
  opacity: 0.8;
`;

export const HistoryPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <HistoryContainer>
      <HistoryTitle>{t('historyPage.title')}</HistoryTitle>
      <HistoryMessage>{t('historyPage.comingSoon')}</HistoryMessage>
    </HistoryContainer>
  );
};
