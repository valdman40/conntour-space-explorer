import React from 'react';
import styled from 'styled-components';
import { sizes } from '../../constants/sizes';
import { Button } from './Button';

interface SearchButtonProps {
  onClick: () => void;
  disabled?: boolean;
  size?: string;
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
  }
`;

export const SearchButton: React.FC<SearchButtonProps> = ({ 
  onClick, 
  disabled = false, 
  size = sizes.icon.sm 
}) => {
  return (
    <StyledSearchButton onClick={onClick} disabled={disabled} title="Search">
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="11" cy="11" r="8"></circle>
        <path d="m21 21-4.35-4.35"></path>
      </svg>
    </StyledSearchButton>
  );
};