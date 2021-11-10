import React from 'react';
import Svg, { Line as SvgLine } from 'react-native-svg';

const Line = ({ length, color }) => {
    return (
        <Svg height='2' width={length}>
            <SvgLine x1='0' y1='0' x2={length} y2='0' stroke={color} strokeWidth='2' />
        </Svg>
    );
}

export default Line;