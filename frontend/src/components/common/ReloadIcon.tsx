import React from 'react';
import styled from 'styled-components';
import { colors } from '../../constants/colors';
import { sizes } from '../../constants/sizes';

interface ReloadIconProps {
  onClick: () => void;
  disabled?: boolean;
  size?: string;
}

const IconButton = styled.button<{ disabled?: boolean }>`
  background: ${colors.interactive.backgroundButton};
  border: 1px solid ${colors.interactive.borderHover};
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  padding: ${sizes.padding.md};
  border-radius: ${sizes.radius.md};
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  opacity: ${props => props.disabled ? 0.5 : 1};
  color: ${colors.text.primary};

  &:hover:not(:disabled) {
    background: ${colors.interactive.backgroundButtonHover};
    transform: ${sizes.effects.transform.lift};
  }

  &:active:not(:disabled) {
    transform: ${sizes.effects.transform.down};
  }

  &:focus {
    outline: none;
    box-shadow: ${sizes.effects.shadow.focus} ${colors.shadow.focus};
  }

  &:disabled {
    cursor: not-allowed;
    transform: none;
  }

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
    <IconButton onClick={onClick} disabled={disabled} title="Reload Images">
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
    </IconButton>
  );
};
