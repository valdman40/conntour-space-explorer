import React, { useState } from 'react';
import styled, { css } from 'styled-components';
import { useTranslation } from 'react-i18next';
import { fadeIn } from './common/animations';
import { LinkButton, Modal } from './common';
import { NasaImage } from './types/NasaImage';
import { colors } from '../constants/colors';
import { sizes } from '../constants/sizes';

// Shared CSS mixin for text clamping
const textClamp = (lines: number) => css`
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: ${lines};
  -webkit-box-orient: vertical;
`;

const Card = styled.div<{ $isClickable?: boolean }>`
  background: rgba(255, 255, 255, 0.1);
  border-radius: 1rem;
  padding: 1.5rem;
  width: 350px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  animation: ${fadeIn} 0.6s ease forwards;
  display: flex;
  justify-content: space-between;
  flex-direction: column;

  ${({ $isClickable }) => $isClickable && css`
    cursor: pointer;
    
    &:hover {
      transform: translateY(-5px);
      box-shadow: 0 12px 40px rgba(0, 0, 0, 0.2);
    }
  `}

  ${({ $isClickable }) => !$isClickable && css`
    &:hover {
      transform: translateY(-5px);
      box-shadow: 0 12px 40px rgba(0, 0, 0, 0.2);
    }
  `}
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
  text-align: start; /* RTL-aware alignment */
  ${textClamp(2)}
`;

const CardDescription = styled.p`
  margin-bottom: 1rem;
  opacity: 0.9;
  line-height: 1.6;
  text-align: start; /* RTL-aware alignment */
  ${textClamp(5)}
`;

const CardContent = styled.div`
  cursor: pointer;
  flex: 1;
`;

const CardDate = styled.div`
  font-size: 0.875rem;
  opacity: 0.8;
  margin-bottom: 1rem;
`;

// Modal content styled components
const ModalImage = styled.img`
  width: 100%;
  max-width: 700px;
  height: auto;
  max-height: 60vh;
  object-fit: contain;
  border-radius: ${sizes.radius.md};
  margin: 0 auto ${sizes.margin.md} auto;
  display: block;
`;

const ModalTitle = styled.h2`
  margin-bottom: ${sizes.margin.md};
  font-size: ${sizes.fontSize['2xl']};
  font-weight: bold;
  color: ${colors.text.primary};
`;

const ModalDescription = styled.p`
  line-height: 1.6;
  color: ${colors.text.primary};
`;

const ModalDate = styled.p`
  margin-top: ${sizes.margin.md};
  font-size: ${sizes.fontSize.sm};
  opacity: 0.8;
  color: ${colors.text.primary};
`;

const ModalButtonContainer = styled.div`
  margin-top: ${sizes.margin.lg};
`;

interface NasaImageCardProps {
  nasaImage: NasaImage;
}

export const NasaImageCard: React.FC<NasaImageCardProps> = React.memo(({ nasaImage }) => {
  const { t } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (!nasaImage) return null;
  const { image_url, name, description, launch_date } = nasaImage;

  const handleCardClick = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent modal from opening when button is clicked
  };

  return (
    <>
      <Card $isClickable={true}>
        <CardContent onClick={handleCardClick}>
          {image_url && (
            <CardImage src={image_url} alt={name} />
          )}
          <CardTitle title={name}>{name}</CardTitle>
          <CardDescription title={description}>{description}</CardDescription>
          <CardDate>
            {launch_date && new Date(launch_date).toLocaleDateString()}
          </CardDate>
        </CardContent>
      </Card>

      <Modal isOpen={isModalOpen} onClose={handleCloseModal}>
        <div>
          {image_url && (
            <ModalImage src={image_url} alt={name} />
          )}
          <ModalTitle>{name}</ModalTitle>
          <ModalDescription>{description}</ModalDescription>
          {launch_date && (
            <ModalDate>
              {new Date(launch_date).toLocaleDateString()}
            </ModalDate>
          )}
        </div>
      </Modal>
    </>
  );
});
