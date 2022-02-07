import * as React from 'react';
import Svg, { Path } from 'react-native-svg';

const Save = ({ size, color }) => (
  <Svg
    width={size || 35}
    height={size || 38}
    fill="none"
    viewBox="0 0 35 38"
    xmlns="http://www.w3.org/2000/svg"
  >
    <Path
      d="M1 4a3 3 0 0 1 3-3h27a3 3 0 0 1 3 3v27.277c0 2.275-2.432 3.722-4.431 2.637l-9.683-5.257a5 5 0 0 0-4.771 0L5.43 33.914C3.432 34.999 1 33.552 1 31.277V4Z"
      fill={color || '#464A4F'}
      stroke="#fff"
      strokeWidth={2}
    />
    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M22.848 10.143A3.87 3.87 0 0 0 20.105 9c-.967 0-1.885.36-2.605 1.015A3.848 3.848 0 0 0 14.896 9a3.873 3.873 0 0 0-2.746 1.146c-1.534 1.54-1.533 3.949.001 5.482l5.35 5.35 5.348-5.35c1.535-1.533 1.535-3.942-.001-5.485Z"
      fill="#fff"
    />
  </Svg>
);

export default Save;
