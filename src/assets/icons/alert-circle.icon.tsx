import * as React from 'react';
import { SvgCss } from 'react-native-svg';

interface Props {
  size?: number;
  color?: string;
}

const xml = `<?xml version="1.0" encoding="iso-8859-1"?>
<!-- Generator: Adobe Illustrator 16.0.0, SVG Export Plug-In . SVG Version: 6.00 Build 0)  -->
<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">
<svg width="61" height="60" viewBox="0 0 61 60" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M27.1426 41.7054C27.1426 41.2616 27.2304 40.8221 27.4011 40.4125C27.5719 40.0029 27.822 39.6312 28.1372 39.3188C28.4524 39.0064 28.8265 38.7595 29.2377 38.5924C29.6488 38.4253 30.0888 38.3414 30.5326 38.3454C31.1872 38.3572 31.8239 38.5616 32.3629 38.9333C32.9019 39.305 33.3196 39.8275 33.5634 40.4352C33.8071 41.0429 33.866 41.7089 33.7333 42.3501C33.6005 42.9912 33.2817 43.5789 32.8166 44.0398C32.3516 44.5007 31.7612 44.8143 31.1189 44.9414C30.4766 45.0685 29.8109 45.0034 29.2054 44.7543C28.5999 44.5051 28.0815 44.0831 27.7146 43.5408C27.3477 42.9985 27.1486 42.3601 27.1426 41.7054ZM28.2225 33.5153L27.8025 17.8553C27.7626 17.4789 27.8025 17.0983 27.9193 16.7382C28.0361 16.3781 28.2272 16.0466 28.4803 15.7652C28.7335 15.4838 29.0431 15.2588 29.3889 15.1047C29.7347 14.9507 30.109 14.8711 30.4875 14.8711C30.8661 14.8711 31.2404 14.9507 31.5862 15.1047C31.932 15.2588 32.2416 15.4838 32.4948 15.7652C32.7479 16.0466 32.939 16.3781 33.0558 16.7382C33.1726 17.0983 33.2125 17.4789 33.1726 17.8553L32.7826 33.5153C32.7826 34.12 32.5426 34.6999 32.115 35.1275C31.6874 35.5551 31.1073 35.7953 30.5026 35.7953C29.8979 35.7953 29.3181 35.5551 28.8905 35.1275C28.4629 34.6999 28.2225 34.12 28.2225 33.5153Z" fill="#C4C4C4"/>
<path d="M30.5 57.75C45.8259 57.75 58.25 45.3259 58.25 30C58.25 14.6741 45.8259 2.25 30.5 2.25C15.1741 2.25 2.75 14.6741 2.75 30C2.75 45.3259 15.1741 57.75 30.5 57.75Z" stroke="#C4C4C4" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`;

const AlertCircleIcon: React.FC<Props> = ({ size, color }) => {
  return <SvgCss xml={xml} width={size} height={size} fill={color} />;
};
export { AlertCircleIcon };
