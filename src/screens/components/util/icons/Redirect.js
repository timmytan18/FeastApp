import * as React from 'react';
import Svg, { G, Path } from 'react-native-svg';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';

const Redirect = ({ color, size }) => (
  <Svg
    width={size || wp(5.6)}
    height={size || wp(5.6)}
    viewBox="0 0 19 19"
    xmlns="http://www.w3.org/2000/svg"
  >
    <G fill={color || '#272D2F'} fillRule="nonzero" opacity={0.9}>
      <Path d="M16.465 17.68V7.205L14.17 9.5v6.885H2.695V4.91H9.58l2.295-2.295H1.4a1 1 0 00-1 1V17.68a1 1 0 001 1h14.065a1 1 0 001-1z" />
      <Path d="M17.589.948l-4.65.423a.5.5 0 00-.31.851l1.311 1.311-7.803 7.803 1.607 1.607 7.803-7.803 1.31 1.31a.5.5 0 00.852-.308l.423-4.65a.5.5 0 00-.543-.544z" />
    </G>
  </Svg>
);

export default Redirect;
