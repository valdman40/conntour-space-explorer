import React, { useState } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { Container, PageHeader, HistoryIcon, ReloadIcon, SearchBar, SearchButton } from './common';
import { SearchPage, HistoryPage } from '../pages';
import { colors } from '../constants/colors';
import { sizes } from '../constants/sizes';

const ToolbarWrapper = styled.div`
  margin: ${sizes.margin.xl} 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${sizes.spacing.md};
  flex-wrap: nowrap;
  width: 100%;
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

const ScrollableArea = styled.div`
  flex: 1;
  overflow-y: auto;
  width: 100%;
  min-height: 0;
`;

const SearchAreaWrapper = styled.div<{ isExpanded: boolean }>`
  position: relative;
  transition: all 0.3s ease-in-out;
  width: ${props => props.isExpanded ? '300px' : '40px'};
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
`;

const SearchBarWrapper = styled.div<{ isVisible: boolean }>`
  position: absolute;
  width: 100%;
  opacity: ${props => props.isVisible ? 1 : 0};
  transition: opacity 0.3s ease-in-out;
  pointer-events: ${props => props.isVisible ? 'auto' : 'none'};
`;

const SearchIconWrapper = styled.div<{ isVisible: boolean }>`
  position: absolute;
  opacity: ${props => props.isVisible ? 1 : 0};
  transition: opacity 0.3s ease-in-out;
  pointer-events: ${props => props.isVisible ? 'auto' : 'none'};
  cursor: pointer;
`;

const MainPage: React.FC = () => {
  const { t } = useTranslation();
  const [currentView, setCurrentView] = useState<'search' | 'history'>('search');
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchExpanded, setIsSearchExpanded] = useState(true);

  const handleHistoryToggle = () => {
    const newView = currentView === 'search' ? 'history' : 'search';
    setCurrentView(newView);
    
    // Animate search bar
    if (newView === 'history') {
      setIsSearchExpanded(false);
    } else {
      setIsSearchExpanded(true);
    }
  };

  const handleSearchIconClick = () => {
    setCurrentView('search');
    setIsSearchExpanded(true);
  };

  const handleReload = () => {
    // This will be passed to SearchPage when needed
    if (currentView === 'search') {
      // TODO: Trigger reload in SearchPage
      console.log('Reload triggered from MainPage');
    }
  };

  const handleSearch = (searchTerm: string) => {
    setSearchTerm(searchTerm);
    // This will be passed to SearchPage
    console.log('Search triggered from MainPage:', searchTerm);
  };

  const getPageSubtitle = () => {
    switch (currentView) {
      case 'history':
        return t('historyPage.subtitle');
      case 'search':
      default:
        return t('searchPage.subtitle');
    }
  };

  return (
    <Container>
      <StickyHeader>
        <PageHeader
          title={t('common.appTitle')}
          subtitle={getPageSubtitle()}
        />
        <ToolbarWrapper>
          <ReloadIcon
            onClick={handleReload}
            disabled={false}
          />
          <SearchAreaWrapper isExpanded={isSearchExpanded}>
            <SearchBarWrapper isVisible={isSearchExpanded}>
              <SearchBar
                onSearch={handleSearch}
                placeholder={t('mainPage.searchPlaceholder')}
                disabled={false}
              />
            </SearchBarWrapper>
            <SearchIconWrapper isVisible={!isSearchExpanded}>
              <SearchButton
                onClick={handleSearchIconClick}
                disabled={false}
              />
            </SearchIconWrapper>
          </SearchAreaWrapper>
          <HistoryIcon
            onClick={handleHistoryToggle}
            disabled={false}
          />
        </ToolbarWrapper>
      </StickyHeader>

      <ScrollableArea>
        {currentView === 'history' ? (
          <HistoryPage />
        ) : (
          <SearchPage />
        )}
      </ScrollableArea>
    </Container>
  );
};

export default MainPage; 