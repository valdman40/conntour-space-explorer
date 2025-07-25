import React from 'react';
import styled from 'styled-components';

const Title = styled.h1`
  font-size: 3rem;
  font-weight: bold;
  text-align: center;
  margin-bottom: 1rem;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
`;

const Subtitle = styled.p`
  text-align: center;
  margin-bottom: 3rem;
  font-size: 1.25rem;
  opacity: 0.9;
`;

interface PageHeaderProps {
  title: string;
  subtitle: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle }) => (
  <>
    <Title>{title}</Title>
    <Subtitle>{subtitle}</Subtitle>
  </>
);
