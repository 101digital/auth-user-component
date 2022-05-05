import * as React from 'react';
import { SvgCss } from 'react-native-svg';

interface Props {
  width?: number;
  height?: number;
  color?: string;
}

const BackIcon: React.FC<Props> = ({ width, height, color = '#5E0CBC' }) => {
  return (
    <SvgCss
      xml={`<svg width="19" height="14" viewBox="0 0 19 14" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M1 7L7 1M1 7L7 13M1 7H18" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>
  `}
      width={width}
      height={height}
    />
  );
};

export { BackIcon };
