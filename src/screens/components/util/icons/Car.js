import * as React from 'react';
import Svg, { Path } from 'react-native-svg';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';

const Car = ({ color, size }) => (
  <Svg width={size || wp(4.9)} height={size || wp(4.9)} viewBox="0 0 19 17">
    <Path
      d="M13.831 0c1.228 0 2.314.866 2.703 2.155l1.3 4.312C18.516 6.786 19 7.534 19 8.404v5.253c0 .791-.38.791-.987.876.012.069.037.133.037.205v1.211c0 .581-.209 1.051-.734 1.051h-.95c-.525 0-.734-.47-.734-1.05v-1.147H3.368v1.261c-.001.527-.028.936-.518.936H1.684c-.525 0-.734-.47-.734-1.05v-1.212c0-.072.025-.135.037-.205-.625-.085-.987-.085-.987-.876V8.404c0-.87.483-1.618 1.167-1.937l1.3-4.312C2.854.865 3.94 0 5.168 0zM4.5 9a1.5 1.5 0 100 3 1.5 1.5 0 000-3zm10 0a1.5 1.5 0 100 3 1.5 1.5 0 000-3zm-.67-7.13H5.17c-.409 0-.969.42-1.189 1.1L2.9 6.303h13.2L15.02 2.97c-.22-.68-.78-1.1-1.19-1.1z"
      fill={color || '#272D2F'}
      fillRule="evenodd"
      fillOpacity={0.9}
    />
  </Svg>
);

export default Car;
