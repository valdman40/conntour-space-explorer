import React from 'react';
import styled from 'styled-components';
import { sizes } from '../../constants/sizes';
import { Button } from './Button';
import { Icon } from './Icon';

type IconSize = keyof typeof sizes.icon;

interface SearchButtonProps {
  onClick: () => void;
  disabled?: boolean;
  size?: IconSize;
}

const StyledSearchButton = styled(Button)`
  /* Override default button styling for icon button */
  padding: ${sizes.padding.md} !important;
  font-weight: normal !important; /* Remove bold font */
  
  /* Ensure square button for icon */
  width: auto;
  height: auto;
  min-width: 48px;
  min-height: 48px;
  
  /* Center the icon */
  display: flex;
  align-items: center;
  justify-content: center;
  
  /* Icon styling */
  svg {
    transition: opacity 0.2s ease;
    width: ${sizes.icon.sm};
    height: ${sizes.icon.sm};
  }

  &:hover svg {
    opacity: 0.8;
  }

  &:disabled svg {
    opacity: 0.5;
  }
`;

export const SearchButton: React.FC<SearchButtonProps> = ({ 
  onClick, 
  disabled = false, 
  size = 'sm' 
}) => {
  return (
    <StyledSearchButton onClick={onClick} disabled={disabled} title="Search">
      <Icon name="search" size={size} />
    </StyledSearchButton>
  );
};