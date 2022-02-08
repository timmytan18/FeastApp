import * as React from 'react';
import { TouchableOpacity } from 'react-native';
import Svg, { Path } from 'react-native-svg';

const BackArrow = ({
  color, size, pressed, style,
}) => (
  <TouchableOpacity onPress={pressed}>
    <Svg width={size} height={size} viewBox="0 0 36 37" style={style}>
      <Path
        d="M20.705 31.495L9 20.692l23.343-.142c1.8-.186 2.7-1.035 2.7-2.55s-.9-2.364-2.7-2.55l-23.297-.144 11.66-10.8c.975-1.051.897-2.164-.237-3.339C19.335-.008 18.212-.097 17.1.9 5.7 9.388 0 15.088 0 18c0 2.912 5.7 8.612 17.1 17.1 1.461 1.265 2.768 1.265 3.92 0 1.153-1.265 1.048-2.466-.315-3.605z"
        fill={color}
        fillRule="nonzero"
      />
    </Svg>
  </TouchableOpacity>
);

export default BackArrow;
