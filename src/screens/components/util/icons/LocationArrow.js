import * as React from 'react';
import Svg, { Path } from 'react-native-svg';

const LocationArrow = ({ size, color }) => (
  <Svg
    width={size}
    height={size}
    viewBox="0 0 19 18"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <Path
      d="M8.53 16.897c.475 1.425 1.374 1.475 2.008.117L17.747 1.57C18.38.208 17.793-.38 16.433.255L.987 7.463c-1.36.634-1.308 1.533.115 2.008l5.571 1.856 1.858 5.57Z"
      fill={color || '#fff'}
    />
  </Svg>
);

export default LocationArrow;
