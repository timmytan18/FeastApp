import * as React from 'react';
import Svg, {
  Defs,
  LinearGradient,
  Stop,
  G,
  Circle,
  Rect,
} from 'react-native-svg';
import { wp } from '../../constants/theme';

const NewPostIcon = (props) => (
  <Svg width={wp(7.1)} height={wp(7.1)} viewBox="0 0 27 27" {...props}>
    <Defs>
      <LinearGradient
        x1="0%"
        y1="0%"
        x2="99.916%"
        y2="99.916%"
        id="prefix__a"
      >
        <Stop stopColor="#FE724C" offset="0%" />
        <Stop stopColor="#FFC529" offset="100%" />
      </LinearGradient>
    </Defs>
    <G fill="none" fillRule="evenodd">
      <Circle fill="url(#prefix__a)" cx={13.44} cy={13.44} r={13.44} />
      <Rect
        fill="#272D2F"
        transform="rotate(90 13.44 13.44)"
        x={12.32}
        y={6.72}
        width={2.24}
        height={13.44}
        rx={1.12}
      />
      <Rect
        fill="#272D2F"
        x={12.32}
        y={6.72}
        width={2.24}
        height={13.44}
        rx={1.12}
      />
    </G>
  </Svg>
);

export default NewPostIcon;
