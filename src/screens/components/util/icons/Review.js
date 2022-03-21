import * as React from 'react';
import Svg, { Rect, Path } from 'react-native-svg';

const Review = (props) => (
  <Svg
    width={20}
    height={20}
    viewBox="0 0 20 22"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <Rect
      x={15.75}
      y={7.35}
      width={5.25}
      height={2.625}
      rx={1}
      fill="#272D2F"
    />
    <Rect
      x={10.5}
      y={13.125}
      width={10.5}
      height={2.625}
      rx={1}
      fill="#272D2F"
    />
    <Rect y={18.9} width={21} height={2.625} rx={1} fill="#272D2F" />
    <Path
      d="m5.159 15.631 8.188-8.188a.3.3 0 0 0 0-.424L9.78 3.453a.3.3 0 0 0-.424 0l-8.188 8.188a.907.907 0 0 0-.238.42l-.845 4.3a.3.3 0 0 0 .352.353l4.3-.845a.906.906 0 0 0 .42-.238ZM16.27 4.52a1.807 1.807 0 0 0 0-2.556L14.837.53a1.807 1.807 0 0 0-2.556 0l-1.222 1.222a.3.3 0 0 0 0 .424l3.566 3.566a.3.3 0 0 0 .424 0l1.221-1.222Z"
      fill="#272D2F"
    />
  </Svg>
);

export default Review;
