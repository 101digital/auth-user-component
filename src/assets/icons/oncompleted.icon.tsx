import * as React from 'react';
import { SvgCss } from 'react-native-svg';

interface Props {
  width?: number;
  height?: number;
  color?: string;
}

const OncompletedIcon: React.FC<Props> = ({ width, height, color = '#DCF5FC' }) => {
  return (
    <SvgCss
      xml={`<svg width="94" height="94" viewBox="0 0 94 94" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M86.1673 43.3967V47C86.1625 55.446 83.4276 63.6641 78.3705 70.4288C73.3135 77.1935 66.2052 82.1422 58.1058 84.5369C50.0064 86.9317 41.3499 86.6441 33.4273 83.7171C25.5047 80.7901 18.7405 75.3806 14.1436 68.2952C9.54661 61.2098 7.36317 52.8282 7.91889 44.4006C8.4746 35.9729 11.7397 27.9506 17.2272 21.5302C22.7148 15.1098 30.1307 10.6352 38.3691 8.7739C46.6074 6.91256 55.2267 7.76415 62.9415 11.2017" stroke="#DCF5FC" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M86.1667 15.6667L47 54.8725L35.25 43.1225" stroke="#DCF5FC" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`}
      width={width}
      height={height}
    />
  );
};

export { OncompletedIcon };
