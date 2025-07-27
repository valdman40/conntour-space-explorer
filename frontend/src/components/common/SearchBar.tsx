import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { colors } from '../../constants/colors';
import { sizes } from '../../constants/sizes';

interface SearchBarProps {
  onSearch: (searchTerm: string) => void;
  placeholder?: string;
  disabled?: boolean;
  isVisible?: boolean;
  value?: string; // Add external value prop
}

const SearchContainer = styled.div<{ $isVisible?: boolean }>`
  position: relative;
  width: 100%;
  max-width: ${sizes.layout.maxWidth};
  cursor: default;
  transition: all 0.3s ease-in-out;
  opacity: ${props => props.$isVisible === false ? 0 : 1};
  transform: ${props => props.$isVisible === false 
    ? 'scale(0.8) translateX(20px)' 
    : 'scale(1) translateX(0)'
  };

  &:hover {
    transform: ${props => props.$isVisible === false 
      ? 'scale(0.8) translateX(20px)' 
      : sizes.effects.transform.lift
    };
  }

  &:focus-within {
    transform: ${props => props.$isVisible === false 
      ? 'scale(0.8) translateX(20px)' 
      : sizes.effects.transform.lift
    };
  }

  &:active {
    transform: ${props => props.$isVisible === false 
      ? 'scale(0.8) translateX(20px)' 
      : sizes.effects.transform.down
    };
  }
`;

const SearchInput = styled.input<{ disabled?: boolean }>`
  width: 100%;
  padding: ${sizes.padding.lg};
  border: 2px solid ${colors.interactive.border};
  border-radius: ${sizes.radius.md};
  background: ${colors.interactive.background};
  color: ${colors.text.primary};
  font-size: ${sizes.fontSize.base};
  transition: all 0.3s ease;
  opacity: ${props => props.disabled ? 0.5 : 1};
  cursor: ${props => props.disabled ? 'not-allowed' : 'text'};

  &::placeholder {
    color: ${colors.text.muted};
  }

  &:focus {
    outline: none;
    border-color: ${colors.interactive.borderFocus};
    background: ${colors.interactive.backgroundHover};
    box-shadow: ${sizes.effects.shadow.focus} ${colors.shadow.focus}, ${sizes.effects.shadow.md} ${colors.shadow.glowStrong};
  }

  &:hover:not(:disabled) {
    border-color: ${colors.interactive.borderHover};
    background: ${colors.interactive.backgroundHover};
    box-shadow: ${sizes.effects.shadow.sm} ${colors.shadow.glow};
  }
`;

const SearchIconWrapper = styled.div<{ disabled?: boolean }>`
  position: absolute;
  right: ${sizes.padding.lg};
  top: 50%;
  transform: translateY(-50%);
  color: ${colors.text.muted};
  pointer-events: none;
  opacity: ${props => props.disabled ? 0.3 : 1};
`;

export const SearchBar: React.FC<SearchBarProps> = ({ 
  onSearch, 
  placeholder = "Search images...", 
  disabled = false,
  isVisible = true,
  value = ""
}) => {
  const [searchTerm, setSearchTerm] = useState(value);

  // Sync with external value changes
  useEffect(() => {
    if (value !== searchTerm) {
      setSearchTerm(value);
    }
  }, [value]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      onSearch(searchTerm.trim());
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    // Trigger search on every keystroke - debouncing will be handled in the saga
    onSearch(value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchTerm.trim()) {
      onSearch(searchTerm.trim());
    }
  };

  return (
    <SearchContainer $isVisible={isVisible}>
      <form onSubmit={handleSubmit}>
        <SearchInput
          type="text"
          value={searchTerm}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
        />
      </form>
      <SearchIconWrapper disabled={disabled}>
        <svg
          width={sizes.icon.sm}
          height={sizes.icon.sm}
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
      </SearchIconWrapper>
    </SearchContainer>
  );
};
