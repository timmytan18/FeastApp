import * as React from 'react';
import Svg, { Path, Circle } from 'react-native-svg';
import { wp } from '../../../../constants/theme';

const MapMarkerRating = ({ color }) => (
  <Svg
    width={wp(14)}
    height={wp(14)}
    viewBox="0 0 30 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M15 1C7.28 1 1 7.514 1 15.51.95 27.21 14.468 36.909 15 37.3c0 0 14.05-10.091 14-21.78C29 7.514 22.719 1 15 1Z"
      fill={color || '#5C6C7F'}
      stroke='#fff'
      strokeWidth={1.1}
    />
    <Circle cx={15} cy={43.5} r={4} fill={color || '#5C6C7F'} />
    <Circle cx={15} cy={43.5} r={1} fill='#fff' />
  </Svg>
);

export default MapMarkerRating;
