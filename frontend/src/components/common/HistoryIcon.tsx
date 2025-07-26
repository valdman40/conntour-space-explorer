import React from 'react';
import styled, { keyframes } from 'styled-components';
import { colors } from '../../constants/colors';
import { sizes } from '../../constants/sizes';

const glow = keyframes`
  0% { box-shadow: 0 0 5px ${colors.shadow.glow}; }
  50% { box-shadow: 0 0 20px ${colors.shadow.glow}, 0 0 30px ${colors.shadow.glow}; }
  100% { box-shadow: 0 0 5px ${colors.shadow.glow}; }
`;

const IconContainer = styled.button<{ disabled?: boolean }>`
  background: ${colors.interactive.backgroundButton};
  border: 1px solid ${colors.interactive.border};
  border-radius: ${sizes.radius.md};
  padding: ${sizes.padding.md};
  color: ${props => props.disabled ? colors.text.disabled : colors.text.primary};
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  transition: all 0.2s ease;
  position: relative;

  &:hover:not(:disabled) {
    background: ${colors.interactive.backgroundButtonHover};
    border-color: ${colors.interactive.borderHover};
    animation: ${glow} 2s ease-in-out infinite;
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px ${colors.shadow.focus};
  }

  &:active:not(:disabled) {
    background: ${colors.interactive.backgroundActive};
    transform: scale(0.95);
  }

  &:disabled {
    opacity: 0.5;
  }

  svg {
    width: 20px;
    height: 20px;
    fill: currentColor;
  }
`;

interface HistoryIconProps {
  onClick: () => void;
  disabled?: boolean;
}

export const HistoryIcon: React.FC<HistoryIconProps> = ({ onClick, disabled = false }) => {
  return (
    <IconContainer 
      onClick={onClick} 
      disabled={disabled}
      title="View History"
      type="button"
    >
      <svg viewBox="0 0 24 24">
        <path d="M13,3A9,9 0 0,0 4,12H1L4.89,15.89L4.96,16.03L9,12H6A7,7 0 0,1 13,5A7,7 0 0,1 20,12A7,7 0 0,1 13,19C11.07,19 9.32,18.21 8.06,16.94L6.64,18.36C8.27,20 10.5,21 13,21A9,9 0 0,0 22,12A9,9 0 0,0 13,3M12,8V13L16.28,15.54L17.04,14.33L13.5,12.25V8H12Z"/>
      </svg>
    </IconContainer>
  );
};
