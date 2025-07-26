import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { colors } from '../../constants/colors';
import { sizes } from '../../constants/sizes';

const LanguageSwitcher = styled.div`
  position: fixed;
  top: ${sizes.spacing.xl};
  right: ${sizes.spacing.xl};
  display: flex;
  gap: ${sizes.spacing.sm};
  direction: ltr;
  z-index: ${sizes.zIndex.modal};
`;

const LanguageButton = styled.button<{ active: boolean }>`
  background: ${props => props.active ? colors.interactive.backgroundActive : colors.interactive.background};
  color: ${colors.text.primary};
  border: 1px solid ${colors.interactive.borderHover};
  padding: ${sizes.padding.sm} ${sizes.padding.lg};
  border-radius: ${sizes.radius.sm};
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: ${colors.interactive.backgroundHover};
    transform: ${sizes.effects.transform.lift};
  }

  &:active {
    transform: ${sizes.effects.transform.down};
  }
`;

export const LanguageSelector: React.FC = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (language: string) => {
    i18n.changeLanguage(language);
  };

  return (
    <LanguageSwitcher>
      <LanguageButton 
        active={i18n.language === 'en'} 
        onClick={() => changeLanguage('en')}
      >
        EN
      </LanguageButton>
      <LanguageButton 
        active={i18n.language === 'he'} 
        onClick={() => changeLanguage('he')}
      >
        עב
      </LanguageButton>
    </LanguageSwitcher>
  );
};
