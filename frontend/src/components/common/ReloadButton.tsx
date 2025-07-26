import React from 'react';
import styled from 'styled-components';
import { sizes } from '../../constants/sizes';
import { Button } from './Button';

interface ReloadIconProps {
  onClick: () => void;
  disabled?: boolean;
  size?: string;
}

const StyledReloadButton = styled(Button)`
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

export const ReloadIcon: React.FC<ReloadIconProps> = ({ 
  onClick, 
  disabled = false, 
  size = sizes.icon.sm 
}) => {
  return (
    <StyledReloadButton onClick={onClick} disabled={disabled} title="Reload Images">
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
        <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path>
        <path d="M21 3v5h-5"></path>
        <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path>
        <path d="M3 21v-5h5"></path>
      </svg>
    </StyledReloadButton>
  );
};
