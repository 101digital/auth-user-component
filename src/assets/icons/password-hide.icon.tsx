import * as React from 'react';
import Svg, { Path } from 'react-native-svg';

interface Props {
  size?: number;
  color?: string;
}

const PasswordHideIcon: React.FC<Props> = ({ size, color }) => {
  return (
    <Svg width={size ? size : 20.086} height={19.414}>
      <Path
        fill="none"
        stroke={color ? color : '#000'}
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M11.918 16.532A10.019 10.019 0 01.5 9.707a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 014.243 4.243M7.921 7.586l4.243 4.243M7.921 7.586l4.242 4.241m0 0l3.291 3.29m-7.531-7.53l-3.29-3.29m0 0L1.043.707m3.59 3.59a10 10 0 0114.953 5.41 10.025 10.025 0 01-4.132 5.411M4.633 4.297l10.821 10.821m0 0l3.589 3.589"
        data-name="Path 9627"
      />
    </Svg>
  );
};
export { PasswordHideIcon };
