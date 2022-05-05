import * as React from 'react';
import { SvgCss } from 'react-native-svg';

interface Props {
  width?: number;
  height?: number;
}

const LoaderIcon: React.FC<Props> = ({ width, height, color = '#F1F6FC' }) => {
  return (
    <SvgCss
      xml={`<svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
<circle cx="30" cy="30" r="30" fill="#E7DBF5"/>
<mask id="mask0_5898_42726" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="0" y="0" width="60" height="60">
<circle cx="30" cy="30" r="30" fill="#E7DBF5"/>
</mask>
<g mask="url(#mask0_5898_42726)">
<path d="M27.5 30L71.5 41L7.5 90.5L-17 -1L30.5 -6.5V30H27.5Z" fill="#8E55D0"/>
</g>
<circle cx="30" cy="30" r="24" fill="${color}"/>
</svg>
`}
      width={width}
      height={height}
    />
  );
};

export { LoaderIcon };
