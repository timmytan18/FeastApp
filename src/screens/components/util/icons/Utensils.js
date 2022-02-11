import * as React from 'react';
import Svg, { Path } from 'react-native-svg';
import { wp } from '../../../../constants/theme';

const Utensils = (props) => (
  <Svg width={wp(5)} height={wp(5)} viewBox="0 0 18 20" {...props}>
    <Path
      d="M8.5 8.889H7.25a.5.5 0 01-.5-.5V.5a.5.5 0 00-.5-.5H5a.5.5 0 00-.5.5v7.889a.5.5 0 01-.5.5H2.75a.5.5 0 01-.5-.5V.5a.5.5 0 00-.5-.5H.5a.5.5 0 00-.5.5v8.389c0 1.838 1.514 3.333 3.375 3.333H4.5V19.5a.5.5 0 00.5.5h1.25a.5.5 0 00.5-.5v-7.278h1.125c1.86 0 3.375-1.495 3.375-3.333V.5a.5.5 0 00-.5-.5H9.5a.5.5 0 00-.5.5v7.889a.5.5 0 01-.5.5zM16.875 0H15.75c-1.304 0-2.25 1.402-2.25 3.333v8.39a.5.5 0 00.5.5h1.75V19.5a.5.5 0 00.5.5h1.25a.5.5 0 00.5-.5V1.111C18 .497 17.497 0 16.875 0z"
      fill="#272D2F"
      fillRule="evenodd"
    />
  </Svg>
);

export default Utensils;
