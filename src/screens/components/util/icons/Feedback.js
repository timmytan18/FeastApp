import * as React from 'react';
import Svg, { Path } from 'react-native-svg';

const Feedback = () => (
  <Svg width={26} height={26} viewBox="0 0 26 26" xmlns="http://www.w3.org/2000/svg">
    <Path
      d="M10.75 14A2.25 2.25 0 0 1 13 16.25v1.502l-.008.108c-.31 2.127-2.22 3.149-5.425 3.149-3.193 0-5.134-1.01-5.553-3.112L2 17.75v-1.5A2.25 2.25 0 0 1 4.25 14h6.5ZM7.5 6a3.5 3.5 0 1 1 0 7 3.5 3.5 0 0 1 0-7Zm12.25-4A2.25 2.25 0 0 1 22 4.25v3.5A2.25 2.25 0 0 1 19.75 10h-1.553l-2.541 2.207A1 1 0 0 1 14 11.452V9.986a2.25 2.25 0 0 1-2-2.236v-3.5A2.25 2.25 0 0 1 14.25 2h5.5Z"
      fill="#4A5B6D"
      fillRule="nonzero"
    />
  </Svg>
);

export default Feedback;
