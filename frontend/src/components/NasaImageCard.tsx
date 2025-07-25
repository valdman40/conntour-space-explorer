import React from 'react';
import styled, { css } from 'styled-components';
import { fadeIn } from './common/animations';
import { LinkButton } from './common';
import { NasaImage } from './types/NasaImage';

// Shared CSS mixin for text clamping
const textClamp = (lines: number) => css`
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: ${lines};
  -webkit-box-orient: vertical;
`;

const Card = styled.div`
  background: rgba(255, 255, 255, 0.1);
  border-radius: 1rem;
  padding: 1.5rem;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  animation: ${fadeIn} 0.6s ease forwards;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.2);
  }
`;

const CardImage = styled.img`
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: 0.5rem;
  margin-bottom: 1rem;
`;

const CardTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  ${textClamp(2)}
`;

const CardDescription = styled.p`
  margin-bottom: 1rem;
  opacity: 0.9;
  line-height: 1.6;
  ${textClamp(5)}
`;

const CardDate = styled.div`
  font-size: 0.875rem;
  opacity: 0.8;
  margin-bottom: 1rem;
`;

interface NasaImageCardProps {
  nasaImage: NasaImage;
}

export const NasaImageCard: React.FC<NasaImageCardProps> = ({ nasaImage }) => {
  if (!nasaImage) return null;
  const { image_url, name, description, launch_date } = nasaImage;
  return (
    <Card>
      {image_url && (
        <CardImage src={image_url} alt={name} />
      )}
      <CardTitle title={name}>{name}</CardTitle>
      <CardDescription title={description}>{description}</CardDescription>
      <CardDate>
        {launch_date && new Date(launch_date).toLocaleDateString()}
      </CardDate>
      {image_url && (
        <LinkButton href={image_url} target="_blank" rel="noopener noreferrer">
          View Full Image
        </LinkButton>
      )}
    </Card>
  );
};
