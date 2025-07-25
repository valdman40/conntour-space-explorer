import React from 'react';
import { Grid } from './common/Grid';
import { NasaImageCard } from './NasaImageCard';
import { NasaImage } from './types/NasaImage';

interface NasaImagesListProps {
  nasaImages: NasaImage[];
}

export const NasaImagesList: React.FC<NasaImagesListProps> = ({ nasaImages }) => {
  return (
    <Grid>
      {nasaImages.map((nasaImage) => (
        <NasaImageCard key={nasaImage.id} nasaImage={nasaImage} />
      ))}
    </Grid>
  );
};
