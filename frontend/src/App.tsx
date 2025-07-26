import React, { useEffect } from 'react';
import MainPage from './components/MainPage';
import { LanguageSelector } from './components/common';
import './i18n'; // Initialize i18n
import styled from 'styled-components';
import { colors } from './constants/colors';

const AppContainer = styled.div`
  position: relative;
  min-height: 100vh;
  background: ${colors.primary};
  direction: ltr;
  
  * {
    direction: ltr;
    text-align: left;
  }
`;

const App: React.FC = () => {
  useEffect(() => {
    // Force LTR direction on document
    document.dir = 'ltr';
    document.documentElement.style.direction = 'ltr';
  }, []);

  return (
    <AppContainer>
      <LanguageSelector />
      <MainPage />
    </AppContainer>
  );
};

export default App; 