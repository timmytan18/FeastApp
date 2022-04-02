import * as React from 'react';
import Svg, { G, Circle, Path } from 'react-native-svg';
import { wp } from '../../../../constants/theme';

const NoProfile = (props) => {
  const { size } = props;

  return (
    <Svg
      width={size || wp(9)}
      height={size || wp(9)}
      viewBox="0 0 38 38"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <Path
        d="M19 0C8.504 0 0 8.504 0 19s8.504 19 19 19 19-8.504 19-19S29.496 0 19 0Zm0 7.355a6.742 6.742 0 1 1 0 13.484 6.742 6.742 0 0 1 0-13.484Zm0 26.661c-4.727 0-8.964-2.133-11.798-5.47 1.514-2.839 4.477-4.796 7.932-4.796.194 0 .387.032.572.088 1.047.337 2.142.554 3.294.554 1.152 0 2.255-.217 3.294-.554.185-.056.378-.088.572-.088 3.455 0 6.418 1.957 7.932 4.796-2.834 3.337-7.07 5.47-11.798 5.47Z"
        fill="#B0BBC7"
        fillRule="evenodd"
      />
    </Svg>
  );
};

export default NoProfile;
