import React, { useState } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';
import { Container } from './common/Container';
import { PageHeader } from './common/PageHeader';
import { LanguageSelector } from './common/LanguageSelector';
import { SearchBar } from './common/SearchBar';
import { Icon } from './common/Icon';
import { colors } from '../constants/colors';
import { sizes } from '../constants/sizes';
import { Button } from './common';
import { useReduxImages } from '../hooks/useReduxImages';

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

const SearchAreaWrapper = styled.div<{ $isCompact: boolean }>`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: width 0.4s ease-in-out;
  width: ${props => props.$isCompact ? '60px' : '300px'};
  overflow: hidden; /* Hide content that overflows during transition */
`;

const CompactSearchButton = styled.button<{ $isVisible: boolean }>`
  position: absolute;
  /* Match the styling of other toolbar buttons */
  padding: ${sizes.padding.md};
  width: auto;
  height: auto;
  min-width: 48px;
  min-height: 48px;
  
  /* Base button styling - matching StyledButton */
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 0.5rem; /* Same as StyledButton */
  color: ${colors.text.primary};
  font-weight: 500;
  cursor: pointer;
  
  /* Layout */
  display: flex;
  align-items: center;
  justify-content: center;
  
  /* Animation */
  transition: all 0.3s ease;
  opacity: ${props => props.$isVisible ? 1 : 0};
  transform: ${props => props.$isVisible 
    ? 'scale(1) rotate(0deg)' 
    : 'scale(0.5) rotate(90deg)'
  };
  transition-delay: ${props => props.$isVisible ? '0.2s' : '0s'};

  &:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.3);
    border-color: rgba(255, 255, 255, 0.4);
    transform: ${props => props.$isVisible 
      ? 'scale(1.05) rotate(0deg)' 
      : 'scale(0.5) rotate(90deg)'
    };
  }

  &:active {
    transform: ${props => props.$isVisible 
      ? 'scale(0.95) rotate(0deg)' 
      : 'scale(0.5) rotate(90deg)'
    };
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
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
    const [searchTerm, setSearchTerm] = useState('');
    
    // Redux hooks for search functionality
    const { searchImagesDebounced } = useReduxImages();

    const isSearchPage = location.pathname === '/search';
    const isReduxSearchPage = location.pathname === '/search-redux';
    const isHistoryPage = location.pathname === '/history';
    const isHistoryDetailPage = location.pathname.startsWith('/history/');
    const shouldShowToolbar = !isHistoryDetailPage;
    const shouldShowSearchBar = isSearchPage || isReduxSearchPage;
    const shouldShowSearchButton = isHistoryPage;

    const handleHistoryToggle = () => {
        navigate('/history');
    };

    const handleSearchButtonClick = () => {
        navigate('/search');
    };

    const handleBackToHistory = () => {
        navigate('/history');
    };

    const handleSearch = (searchTerm: string) => {
        setSearchTerm(searchTerm);
        // Navigate to search page if not already there
        if (!isSearchPage && !isReduxSearchPage) {
            navigate('/search');
        }
        
        // Always trigger the debounced search (handles both search and clear)
        searchImagesDebounced(searchTerm);
        console.log('Debounced search triggered from Layout:', searchTerm || '(empty - will load all images)');
    };

    const getSubtitle = () => {
        switch (location.pathname) {
            case '/search':
                return t('searchPage.subtitle');
            case '/search-redux':
                return t('searchPage.subtitle') + ' (Redux)';
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
                            {/* <Button onClick={handleSearchButtonClick} title={t('mainPage.reloadButton')}>
                                <Icon name="reload" size="sm" />
                            </Button> */}
                            <SearchAreaWrapper $isCompact={shouldShowSearchButton}>
                                <SearchBar
                                    onSearch={handleSearch}
                                    placeholder={t('mainPage.searchPlaceholder')}
                                    disabled={false}
                                    isVisible={shouldShowSearchBar}
                                />
                                <CompactSearchButton 
                                    $isVisible={shouldShowSearchButton}
                                    onClick={handleSearchButtonClick} 
                                    title={t('mainPage.searchPage')}
                                >
                                    <Icon name="search" size="sm" />
                                </CompactSearchButton>
                            </SearchAreaWrapper>
                            <Button onClick={handleHistoryToggle} title={t('mainPage.historyButton')}>
                                <Icon name="history" size="sm" />
                            </Button>
                            <LanguageSelector />
                        </ToolbarWrapper>
                    )}
                    {!shouldShowToolbar && (
                        <ToolbarWrapper>
                            <Button onClick={handleBackToHistory} title={t('common.back')}>
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
