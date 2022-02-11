import * as React from 'react';
import Svg, { Path } from 'react-native-svg';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';

const MapMarker = (props) => {
  const { color, size } = props;
  return (
    <Svg width={size || wp(5.3)} height={size || wp(5.3)} viewBox="0 0 17 22" {...props}>
      <Path
        d="M8.372 0C3.756 0 0 3.814 0 8.495c-.03 6.849 8.054 12.527 8.372 12.757 0 0 8.402-5.908 8.372-12.751C16.744 3.814 12.988 0 8.372 0zm0 12.751c-2.313 0-4.186-1.902-4.186-4.25 0-2.349 1.873-4.25 4.186-4.25 2.313 0 4.186 1.901 4.186 4.25 0 2.348-1.873 4.25-4.186 4.25z"
        fill={color || '#272D2F'}
        fillRule="evenodd"
      />
    </Svg>
  );
};

export default MapMarker;
