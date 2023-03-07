import * as React from 'react';
import { SvgCss } from 'react-native-svg';

interface Props {
    width?: number;
    height?: number;
    color?: string;
}

const TickIcon: React.FC<Props> = ({ width, height, color }) => {
    return (
        <SvgCss
            xml={`<svg width="18" height="12" viewBox="0 0 18 12" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M17.2803 0.21967C17.5732 0.512563 17.5732 0.987437 17.2803 1.28033L7.28033 11.2803C6.98744 11.5732 6.51256 11.5732 6.21967 11.2803L0.71967 5.78033C0.426777 5.48744 0.426777 5.01256 0.71967 4.71967C1.01256 4.42678 1.48744 4.42678 1.78033 4.71967L6.75 9.68934L16.2197 0.21967C16.5126 -0.0732233 16.9874 -0.0732233 17.2803 0.21967Z" fill="#1B1B1B"/>
            </svg>`}
            width={width}
            height={height}
            fill={color}
        />
    );
};
export { TickIcon };
