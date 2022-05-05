import * as React from 'react';
import { SvgCss } from 'react-native-svg';

interface Props {
  width?: number;
  height?: number;
  color?: string;
}

const InformationIcon: React.FC<Props> = ({ width, height, color = '#FF9800' }) => {
  return (
    <SvgCss
      xml={`<svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M30 55C43.8071 55 55 43.8071 55 30C55 16.1929 43.8071 5 30 5C16.1929 5 5 16.1929 5 30C5 43.8071 16.1929 55 30 55Z" stroke="${color}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M30 40V30" stroke="${color}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M30 20H30.025" stroke="${color}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      `}
      width={width}
      height={height}
    />
  );
};

export { InformationIcon };
