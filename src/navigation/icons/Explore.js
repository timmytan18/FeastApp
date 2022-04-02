import * as React from 'react';
import Svg, { Path, Circle } from 'react-native-svg';
import { wp } from '../../constants/theme';

const size = wp(8.41);

const ExploreIcon = (props) => (
  <Svg
    width={size}
    height={size}
    viewBox="0 0 33 33"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <Path
      d="M17 29.054c-4.856 0-7.759-.823-9.495-2.56-1.736-1.736-2.56-4.639-2.56-9.494 0-4.856.824-7.759 2.56-9.495 1.736-1.736 4.64-2.56 9.495-2.56 4.855 0 7.758.824 9.495 2.56 1.736 1.736 2.559 4.64 2.559 9.495 0 4.855-.823 7.758-2.56 9.495-1.736 1.736-4.639 2.559-9.494 2.559Z"
      stroke="#272D2F"
      strokeWidth={2.1}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="m14.578 14.578 7.05-2.205-2.206 7.047-7.05 2.207 2.206-7.049Z"
      fill="#fff"
      stroke="#272D2F"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Circle cx={17.03} cy={17.03} r={1.03} fill="#272D2F" />
  </Svg>
);

const ExploreFilledIcon = (props) => (
  <Svg
    width={size}
    height={size}
    viewBox="0 0 33 33"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <Circle cx={17.03} cy={17.03} r={1.03} fill="#272D2F" />
    <Path
      d="M17 29.054c-4.856 0-7.759-.823-9.495-2.56-1.736-1.736-2.56-4.639-2.56-9.494 0-4.856.824-7.759 2.56-9.495 1.736-1.736 4.64-2.56 9.495-2.56 4.855 0 7.758.824 9.495 2.56 1.736 1.736 2.559 4.64 2.559 9.495 0 4.855-.823 7.758-2.56 9.495-1.736 1.736-4.639 2.559-9.494 2.559Z"
      fill="#272D2F"
      stroke="#272D2F"
      strokeWidth={2.1}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="m14.459 14.459 7.397-2.315-2.315 7.396-7.397 2.316 2.315-7.397Z"
      fill="#fff"
      stroke="#fff"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Circle cx={17.05} cy={17.05} r={1.25} fill="#272D2F" />
  </Svg>
);

export { ExploreIcon, ExploreFilledIcon };
