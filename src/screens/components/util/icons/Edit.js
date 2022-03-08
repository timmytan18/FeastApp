import * as React from 'react';
import Svg, { Path } from 'react-native-svg';

const Edit = (props) => (
  <Svg
    width={22}
    height={22}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M18.086 1.5a2 2 0 0 1 2.828 0L22.5 3.086a2 2 0 0 1 0 2.828l-6.5 6.5a2 2 0 0 1-1.414.586H12a1 1 0 0 1-1-1V9.414A2 2 0 0 1 11.586 8l6.5-6.5Zm3 3L19.5 2.914l-6.5 6.5V11h1.586l6.5-6.5ZM4 4a1 1 0 0 0-1 1v15a1 1 0 0 0 1 1h15a1 1 0 0 0 1-1v-8a1 1 0 1 1 2 0v8a3 3 0 0 1-3 3H4a3 3 0 0 1-3-3V5a3 3 0 0 1 3-3h8a1 1 0 1 1 0 2H4Z"
      fill="#272D2F"
    />
  </Svg>
);

export default Edit;
