import * as React from 'react';
import Svg, {
  Defs, LinearGradient, Stop, Path,
} from 'react-native-svg';
import { wp } from '../../../../constants/theme';

const HeartEyes = (props) => {
  const size = props.size ? props.size : wp(9.6);
  return (
    <Svg width={size} height={size} viewBox="0 0 36 36" {...props}>
      <Defs>
        <LinearGradient
          x1="81.97%"
          y1="0%"
          x2="18.939%"
          y2="100%"
          id="prefix__a"
        >
          <Stop stopColor="#AF6CFF" offset="0%" />
          <Stop stopColor="#7928C0" offset="100%" />
        </LinearGradient>
      </Defs>
      <Path
        d="M314 437c-9.925 0-18 8.075-18 18s8.075 18 18 18 18-8.075 18-18-8.075-18-18-18zm-10.017 11.64a2.681 2.681 0 013.72-.12 2.682 2.682 0 013.717.06 2.675 2.675 0 01.033 3.812l-3.69 3.75-3.748-3.69a2.67 2.67 0 01-.032-3.811zM314 465.8c-7.2 0-9-7.2-9-7.2 3.992.717 6.992 1.076 9 1.076 1.992 0 4.992-.359 9-1.076 0 0-1.8 7.2-9 7.2zm10.053-13.408l-3.69 3.75-3.748-3.69a2.672 2.672 0 01-.034-3.811 2.681 2.681 0 013.722-.12 2.682 2.682 0 013.717.06 2.673 2.673 0 01.033 3.81z"
        transform="translate(-296 -437)"
        fill="url(#prefix__a)"
        fillRule="evenodd"
      />
    </Svg>
  );
};

export default HeartEyes;
