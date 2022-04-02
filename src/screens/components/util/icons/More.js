import * as React from 'react';
import Svg, { G, Rect } from 'react-native-svg';
import { wp } from '../../../../constants/theme';

const More = (props) => (
  <Svg width={wp(6.5)} height={wp(6.5)} viewBox="0 0 23 18" {...props}>
    <G fill="#272D2F" fillRule="evenodd">
      <Rect x={4.5} width={13.5} height={2.7} rx={1.35} />
      <Rect x={4.5} y={14.4} width={13.5} height={2.7} rx={1.35} />
      <Rect y={7.2} width={22.5} height={2.7} rx={1.35} />
    </G>
  </Svg>
);

export default More;
