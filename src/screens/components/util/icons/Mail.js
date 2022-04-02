import * as React from 'react';
import Svg, { G, Rect, Path } from 'react-native-svg';
import { wp } from '../../../../constants/theme';

const Mail = (props) => (
  <Svg width={wp(5.8)} height={wp(4.3)} viewBox="0 0 21 16" {...props}>
    <G stroke="#44566C" strokeWidth={2} fill="none" fillRule="evenodd">
      <Rect x={1} y={1} width={19} height={14} rx={2} />
      <Path d="M1 1l9.486 8L20 1" />
    </G>
  </Svg>
);

export default Mail;
