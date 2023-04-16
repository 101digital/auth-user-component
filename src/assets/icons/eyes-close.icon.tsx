import * as React from 'react';
import { SvgCss } from 'react-native-svg';

interface Props {
  size?: number;
  color?: string;
}

const EyesClosedIcon: React.FC<Props> = ({ size = 30 }) => {
  return (
    <SvgCss
      xml={`<?xml version="1.0" encoding="UTF-8"?>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M15.5819 12.0019C15.5819 13.9819 13.9819 15.5819 12.0019 15.5819C10.0219 15.5819 8.42188 13.9819 8.42188 12.0019C8.42188 10.0219 10.0219 8.42188 12.0019 8.42188C13.9819 8.42188 15.5819 10.0219 15.5819 12.0019Z" stroke="black" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M12.0037 20.2688C15.5337 20.2688 18.8238 18.1887 21.1138 14.5887C22.0138 13.1787 22.0138 10.8087 21.1138 9.39875C18.8238 5.79875 15.5337 3.71875 12.0037 3.71875C8.47375 3.71875 5.18375 5.79875 2.89375 9.39875C1.99375 10.8087 1.99375 13.1787 2.89375 14.5887C5.18375 18.1887 8.47375 20.2688 12.0037 20.2688Z" stroke="black" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`}
      width={size}
      height={size}
    />
  );
};
export { EyesClosedIcon };
