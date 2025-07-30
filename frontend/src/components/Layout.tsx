import React from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';
import { Container } from './common/Container';
import { PageHeader } from './common/PageHeader';
import { LanguageSelector } from './common/LanguageSelector';
import { Icon } from './common/Icon';
import { colors } from '../constants/colors';
import { sizes } from '../constants/sizes';
import { Button } from './common';

const LayoutContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
`;

const StickyHeader = styled.div`
  position: sticky;
  top: 0;
  background: ${colors.primary};
  z-index: ${sizes.zIndex.sticky};
  padding-bottom: ${sizes.padding.lg};
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const ToolbarWrapper = styled.div`
  margin: ${sizes.margin.xl} 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${sizes.spacing.md};
  flex-wrap: nowrap;
  width: 100%;
`;

const CompactSearchButton = styled(Button)`
  /* Override default size for compact appearance */
  min-width: 48px;
  min-height: 48px;
  padding: ${sizes.padding.md};
  
  /* Enhanced hover transform */
  &:hover:not(:disabled) {
    transform: scale(1.05) translateY(-2px);
  }

  &:active:not(:disabled) {
    transform: scale(0.95);
  }
`;

const MainContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  width: 100%;
  min-height: 0;
`;

interface LayoutProps {
    children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();

    const isHistoryDetailPage = location.pathname.startsWith('/history/');
    const shouldShowToolbar = !isHistoryDetailPage;

    const goToHistoryPage = () => {
        navigate('/history');
    };

    const goToSearchPage = () => {
        navigate('/search');
    };

    const getSubtitle = () => {
        switch (location.pathname) {
            case '/search':
                return t('searchPage.subtitle');
            case '/history':
                return t('historyPage.subtitle');
            default:
                if (location.pathname.startsWith('/history/')) {
                    return t('historyDetailPage.subtitle');
                }
                return t('searchPage.subtitle');
        }
    };

    return (
        <LayoutContainer>
            <Container>
                <StickyHeader>
                    <PageHeader
                        title={t('common.appTitle')}
                        subtitle={getSubtitle()}
                    />
                    {shouldShowToolbar && (
                        <ToolbarWrapper>
                            <CompactSearchButton 
                                onClick={goToSearchPage} 
                                title={t('mainPage.searchPage')}
                            >
                                <Icon name="search" size="sm" />
                            </CompactSearchButton>
                            <Button onClick={goToHistoryPage} title={t('mainPage.historyButton')}>
                                <Icon name="history" size="sm" />
                            </Button>
                            <LanguageSelector />
                        </ToolbarWrapper>
                    )}
                    {!shouldShowToolbar && (
                        <ToolbarWrapper>
                            <Button onClick={goToHistoryPage} title={t('common.back')}>
                                {t('common.back')}
                            </Button>
                            <LanguageSelector />
                        </ToolbarWrapper>
                    )}
                </StickyHeader>

                <MainContent>
                    {children}
                </MainContent>
            </Container>
        </LayoutContainer>
    );
};
