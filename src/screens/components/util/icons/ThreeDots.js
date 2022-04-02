import * as React from 'react';
import { View } from 'react-native';
import Svg, { G, Circle } from 'react-native-svg';
import { wp } from '../../../../constants/theme';

const ThreeDots = (props) => {
  const { rotated, size } = props;
  return (
    <View style={{ transform: rotated ? [{ rotate: '90deg' }] : null }}>
      <Svg width={size || wp(7)} height={size || wp(7)} viewBox="0 0 23 5" {...props}>
        <G fill="#4A5B6D" fillRule="evenodd">
          <Circle transform="rotate(-90 2.5 2.5)" cx={2.5} cy={2.5} r={2.5} />
          <Circle transform="rotate(-90 11.5 2.5)" cx={11.5} cy={2.5} r={2.5} />
          <Circle transform="rotate(-90 20.5 2.5)" cx={20.5} cy={2.5} r={2.5} />
        </G>
      </Svg>
    </View>
  );
};

export default ThreeDots;
