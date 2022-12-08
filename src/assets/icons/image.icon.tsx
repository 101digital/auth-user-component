import * as React from 'react';
import Svg, { Path, SvgProps } from 'react-native-svg';
import { colors } from '..';

function ImageIcon(props: SvgProps) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" {...props}>
      <Path
        d="M2.577 19.011l-.02.02c-.27-.59-.44-1.26-.51-2 .07.73.26 1.39.53 1.98zM8.997 10.377a2.38 2.38 0 100-4.76 2.38 2.38 0 000 4.76z"
        fill={props.color ?? colors.white}
      />
      <Path
        d="M16.19 2H7.81C4.17 2 2 4.17 2 7.81v8.38c0 1.09.19 2.04.56 2.84.86 1.9 2.7 2.97 5.25 2.97h8.38c3.64 0 5.81-2.17 5.81-5.81V7.81C22 4.17 19.83 2 16.19 2zm4.18 10.5c-.78-.67-2.04-.67-2.82 0l-4.16 3.57c-.78.67-2.04.67-2.82 0l-.34-.28c-.71-.62-1.84-.68-2.64-.14l-3.74 2.51c-.22-.56-.35-1.21-.35-1.97V7.81c0-2.82 1.49-4.31 4.31-4.31h8.38c2.82 0 4.31 1.49 4.31 4.31v4.8l-.13-.11z"
        fill={props.color ?? colors.white}
      />
    </Svg>
  );
}

export default ImageIcon;
