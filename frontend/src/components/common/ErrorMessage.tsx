import React from 'react';
import styled from 'styled-components';
import { colors } from '../../constants/colors';
import { sizes } from '../../constants/sizes';

const ErrorContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  text-align: center;
  color: ${colors.error};
  font-size: ${sizes.fontSize.lg};
  margin: ${sizes.margin.xl} 0;
  padding: ${sizes.padding.lg};
`;

interface ErrorMessageProps {
  message: string;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => (
  <ErrorContainer>{message}</ErrorContainer>
);
