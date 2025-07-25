import React from 'react';
import styled from 'styled-components';

const ErrorContainer = styled.div`
  text-align: center;
  color: #ff6b6b;
  font-size: 1.25rem;
  margin-top: 2rem;
`;

interface ErrorMessageProps {
  message: string;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => (
  <ErrorContainer>{message}</ErrorContainer>
);
