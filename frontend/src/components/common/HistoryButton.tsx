import React from 'react';
import styled from 'styled-components';
import { Button } from './Button';
import { sizes } from '../../constants/sizes';

interface HistoryIconProps {
  onClick: () => void;
  disabled?: boolean;
  size?: string;
}

const HistoryButtonStyled = styled(Button)`
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
    width: ${sizes.icon.sm};
    height: ${sizes.icon.sm};
    fill: currentColor;
    transition: opacity 0.2s ease;
  }
`;

export const HistoryIcon: React.FC<HistoryIconProps> = ({ 
  onClick, 
  disabled = false, 
  size = sizes.icon.sm 
}) => {
  return (
    <HistoryButtonStyled 
      onClick={onClick} 
      disabled={disabled}
      title="View History"
    >
      <svg viewBox="0 0 24 24" width={size} height={size}>
        <path d="M13,3A9,9 0 0,0 4,12H1L4.89,15.89L4.96,16.03L9,12H6A7,7 0 0,1 13,5A7,7 0 0,1 20,12A7,7 0 0,1 13,19C11.07,19 9.32,18.21 8.06,16.94L6.64,18.36C8.27,20 10.5,21 13,21A9,9 0 0,0 22,12A9,9 0 0,0 13,3M12,8V13L16.28,15.54L17.04,14.33L13.5,12.25V8H12Z"/>
      </svg>
    </HistoryButtonStyled>
  );
};
