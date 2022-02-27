import * as React from 'react';
import Svg, { Path } from 'react-native-svg';

const NextArrow = ({ color, size }) => (
  <Svg width={size || 10} height={size || 12} viewBox="0 0 10 12">
    <Path
      d="M9.023 6.81a.866.866 0 01-.052.04l-7.09 4.936a1.009 1.009 0 01-1.358-.19.866.866 0 01.176-1.259L6.75 6.125.7 1.913A.866.866 0 01.522.654a1.009 1.009 0 011.358-.19L8.97 5.4a.865.865 0 01.37.768l-.002.014.002-.014a.864.864 0 01-.318.642z"
      fill={color || '#7928C0'}
      fillRule="evenodd"
    />
  </Svg>
);

export default NextArrow;
