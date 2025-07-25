import React, { useMemo } from 'react';
import { Grid } from './common/Grid';
import { NasaImageCard } from './NasaImageCard';
import { NasaImage } from './types/NasaImage';

interface NasaImagesListProps {
  nasaImages: NasaImage[];
}

export const NasaImagesList: React.FC<NasaImagesListProps> = ({ nasaImages }) => {
  // Simple optimization: memoize the rendered cards
  const renderedCards = useMemo(() => {
    return nasaImages.map((nasaImage) => (
      <NasaImageCard key={nasaImage.id} nasaImage={nasaImage} />
    ));
  }, [nasaImages]);

  return (
    <Grid>
      {renderedCards}
    </Grid>
  );
};
