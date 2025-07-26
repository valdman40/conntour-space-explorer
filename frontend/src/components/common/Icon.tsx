import React from 'react';
import { icons, defaultSvgProps, IconName } from '../../constants/icons';
import { sizes } from '../../constants/sizes';

type IconSize = keyof typeof sizes.icon;

interface IconProps {
  name: IconName;
  size?: IconSize;
  className?: string;
  style?: React.CSSProperties;
}

export const Icon: React.FC<IconProps> = ({ 
  name, 
  size = 'md', 
  className, 
  style 
}) => {
  const iconData = icons[name];
  
  if (!iconData) {
    console.warn(`Icon "${name}" not found`);
    return null;
  }

  const iconSize = sizes.icon[size];

  return (
    <svg
      width={iconSize}
      height={iconSize}
      viewBox={iconData.viewBox}
      className={className}
      style={style}
      {...defaultSvgProps}
    >
      {iconData.path}
    </svg>
  );
};
