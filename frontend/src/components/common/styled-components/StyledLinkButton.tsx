import styled, { css } from 'styled-components';

interface LinkButtonProps {
  variant?: 'primary' | 'secondary';
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
  centered?: boolean;
}

const buttonVariants = {
  primary: css`
    background: rgba(255, 255, 255, 0.2);
    border: 1px solid rgba(255, 255, 255, 0.3);
    
    &:hover {
      background: rgba(255, 255, 255, 0.3);
    }
  `,
  secondary: css`
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    
    &:hover {
      background: rgba(255, 255, 255, 0.2);
    }
  `
};

const buttonSizes = {
  small: css`
    padding: 0.5rem 1rem;
    font-size: 0.875rem;
  `,
  medium: css`
    padding: 0.75rem 1.5rem;
    font-size: 1rem;
  `,
  large: css`
    padding: 1rem 2rem;
    font-size: 1.125rem;
  `
};

const StyledLinkButton = styled.a<LinkButtonProps>`
  /* Base styles */
  display: inline-block;
  color: white;
  border-radius: 0.5rem;
  font-weight: 500;
  cursor: pointer;
  text-decoration: none;
  transition: all 0.3s ease;
  
  /* Size variants */
  ${props => buttonSizes[props.size || 'medium']}
  
  /* Style variants */
  ${props => buttonVariants[props.variant || 'primary']}
  
  /* Layout modifiers */
  ${props => props.fullWidth && css`
    width: 100%;
  `}
  
  ${props => props.centered && css`
    display: block;
    margin-left: auto;
    margin-right: auto;
  `}
  
  /* Hover effects */
  &:hover {
    transform: translateY(-2px);
    text-decoration: none;
    color: white;
  }
  
  &:active {
    transform: translateY(0);
  }
`;

export default StyledLinkButton;
