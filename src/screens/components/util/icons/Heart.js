import * as React from 'react';
import Svg, {
  Defs, LinearGradient, Stop, Path,
} from 'react-native-svg';
import { wp } from '../../../../constants/theme';

const Heart = (props) => {
  const { size } = props;
  return (
    <Svg width={size || wp(7)} height={size || wp(7)} viewBox="0 0 24 22" {...props}>
      <Defs>
        <LinearGradient
          x1="81.97%"
          y1="7.986%"
          x2="18.939%"
          y2="92.014%"
          id="prefix__a"
        >
          <Stop stopColor="#AF6CFF" offset="0%" />
          <Stop stopColor="#7928C0" offset="100%" />
        </LinearGradient>
      </Defs>
      <Path
        d="M21.873 2.1A7.164 7.164 0 0016.81 0C15.024 0 13.329.66 12 1.865A7.124 7.124 0 007.192 0c-1.899 0-3.696.746-5.07 2.105-2.83 2.828-2.83 7.253.003 10.07L12 22l9.875-9.825c2.833-2.817 2.834-7.242-.002-10.075z"
        fill="url(#prefix__a)"
        fillRule="evenodd"
      />
    </Svg>
  );
};

export default Heart;
