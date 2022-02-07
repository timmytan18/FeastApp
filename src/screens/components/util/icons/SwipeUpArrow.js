import * as React from 'react';
import Svg, { Path } from 'react-native-svg';

const SwipeUpArrow = (props) => (
  <Svg
    width={20}
    height={11}
    viewBox="0 0 20 11"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M.722 10.012a1.323 1.323 0 0 0 1.486-.195l7.6-6.827 7.601 6.827a1.323 1.323 0 0 0 1.769-1.969l-8.36-7.51a1.323 1.323 0 0 0-1.01-.332A1.323 1.323 0 0 0 8.8.339l-8.36 7.51c-.69.62-.544 1.74.283 2.163Z"
      fill="#FAFBFB"
    />
  </Svg>
);

export default SwipeUpArrow;
