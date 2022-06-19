import * as React from 'react';
import Svg, { Defs, G, Path } from 'react-native-svg';
interface Props {
  size?: number;
  color?: string;
}

const PasswordShowIcon: React.FC<Props> = ({ size, color }) => {
  return (
    <Svg width={size ? size : 20.084} height={15} viewBox="0 0 20.084 15">
      <Defs />
      <G id="prefix__password-view" transform="translate(-.958 -.5)">
        <Path
          id="prefix__Path_11383"
          d="M13.121 10.121A3 3 0 1011 11a3 3 0 002.121-.879z"
          fill="none"
          stroke={color ? color : '#000'}
          stroke-linecap="round"
          stroke-linejoin="round"
          data-name="Path 11383"
        />
        <Path
          id="prefix__Path_11384"
          d="M1.458 8a10 10 0 0119.084 0A10 10 0 011.458 8z"
          fill="none"
          stroke={color ? color : '#000'}
          stroke-linecap="round"
          stroke-linejoin="round"
          data-name="Path 11384"
        />
      </G>
    </Svg>
  );
};
export { PasswordShowIcon };
