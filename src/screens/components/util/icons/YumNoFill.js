import * as React from 'react';
import Svg, { G, Circle, Path } from 'react-native-svg';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';

const YumNoFill = (props) => {
  const { size } = props;

  return (
    <Svg
      width={size || wp(7)}
      height={size || wp(7)}
      viewBox="0 0 38 38"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <G fill="none" fillRule="evenodd">
        <Circle fill="#464A4F" cx={19} cy={19} r={17} />
        <Path
          d="M19 0C8.507 0 0 8.507 0 19s8.507 19 19 19 19-8.507 19-19S29.493 0 19 0zm0 2c9.378 0 17 7.622 17 17s-7.622 17-17 17S2 28.378 2 19 9.622 2 19 2zm2.267 18.604c-2.696.253-2.922 2.278-2.922 3.875 0 1.065-.273 1.726-.82 1.983-1.207-.183-1.553-.265-2.887-.844-1.345-.584-2.428-1.627-3.189-2.637a8.548 8.548 0 01-.41-.581 1.058 1.058 0 00-1.474-.312 1.067 1.067 0 00-.312 1.46c2.097 3.258 5.596 5.241 9.393 5.355.113.014.24.014.354.014 2.04 0 4.01-.539 5.723-1.545.071-.028.142-.07.213-.113a11.619 11.619 0 003.81-3.712 1.067 1.067 0 00-.311-1.459 1.058 1.058 0 00-1.473.312c-.128.198-.327.397-.469.58-.157.215-.66.642-1.206 1.084l-.414.332c-.55.439-1.07.845-1.26 1.021.137-.28.27-.962.402-2.043.274-1.916-.89-2.944-2.748-2.77zm4.414-8.63c-1.955 0-3.281 1.444-3.281 3.399 0 .58.092 1.205.604 1.205.513 0 .472-.547.744-1.205.288-.695.96-1.291 2.04-1.291 1.079 0 1.712.734 1.992 1.291.198.394.34 1.205.783 1.205s.612-.624.612-1.205c0-1.955-1.539-3.4-3.494-3.4zm-13.056-.057c-1.955 0-3.494 1.444-3.494 3.4 0 .58.17 1.204.612 1.204.443 0 .585-.81.783-1.205.28-.556.914-1.29 1.992-1.29 1.08 0 1.753.595 2.04 1.29.273.658.231 1.205.744 1.205.512 0 .604-.624.604-1.205 0-1.955-1.326-3.4-3.281-3.4z"
          fill="#fff"
        />
      </G>
    </Svg>
  );
};

export default YumNoFill;
