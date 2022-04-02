import * as React from 'react';
import Svg, { Path } from 'react-native-svg';
import { wp } from '../../../../constants/theme';

const Search = (props) => {
  const { color, size } = props;
  return (
    <Svg
      width={size || wp(4)}
      height={size || wp(4)}
      viewBox="0 0 16 16"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <Path
        d="M6.842 13.684c1.58 0 3.03-.543 4.189-1.444L14.79 16 16 14.79l-3.76-3.759a6.8 6.8 0 001.445-4.189A6.85 6.85 0 006.842 0 6.85 6.85 0 000 6.842a6.85 6.85 0 006.842 6.842zm0-11.974a5.137 5.137 0 015.132 5.132 5.137 5.137 0 01-5.132 5.131 5.137 5.137 0 01-5.131-5.131A5.137 5.137 0 016.842 1.71z"
        fill={color || '#272D2F'}
        fillRule="nonzero"
      />
    </Svg>
  );
};

export default Search;
