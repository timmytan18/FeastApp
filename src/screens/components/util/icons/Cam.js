import * as React from 'react';
import Svg, { G, Path } from 'react-native-svg';
import { wp } from '../../../../constants/theme';

const Cam = (props) => (
  <Svg width={wp(5.3)} height={wp(5.3)} viewBox="0 0 22 20" {...props}>
    <G fill="#4A5B6D" fillRule="evenodd">
      <Path d="M11 8c-1.626 0-3 1.374-3 3s1.374 3 3 3 3-1.374 3-3-1.374-3-3-3z" />
      <Path d="M19.636 3.333h-2.82L13.861.326A1.076 1.076 0 0013.091 0H8.727c-.29 0-.567.117-.771.326L5.003 3.333H2.182C.979 3.333 0 4.33 0 5.556v12.222C0 19.003.979 20 2.182 20h17.454c1.204 0 2.182-.997 2.182-2.222V5.556c0-1.226-.978-2.223-2.182-2.223zm-8.681 13.223c-2.981 0-5.5-2.52-5.5-5.5 0-2.981 2.519-5.5 5.5-5.5 2.98 0 5.5 2.519 5.5 5.5 0 2.98-2.52 5.5-5.5 5.5z" />
    </G>
  </Svg>
);

export default Cam;
