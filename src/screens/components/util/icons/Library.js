import * as React from 'react';
import Svg, { Path } from 'react-native-svg';
import { wp } from '../../../../constants/theme';

const Library = (props) => (
  <Svg width={wp(4.85)} height={wp(4.85)} viewBox="0 0 18 20" {...props}>
    <Path
      d="M16.79 0H2.963C1.772 0 0 .799 0 3v14c0 2.201 1.772 3 2.963 3h14.815v-2H2.975c-.456-.012-1-.194-1-1s.544-.988 1-1h14.803V1c0-.553-.442-1-.988-1zM6.423 3c.82 0 1.484.673 1.484 1.503 0 .83-.665 1.503-1.484 1.503-.82 0-1.485-.673-1.485-1.503 0-.83.665-1.503 1.485-1.503zm2.466 8H3.95l2.963-3 1.481 1.399L11.358 6l3.457 5H8.889z"
      fill="#4A5B6D"
      fillRule="evenodd"
    />
  </Svg>
);

export default Library;
