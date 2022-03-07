import React from 'react';
import { View, Text } from 'react-native';
import Stars from 'react-native-stars';
import MaskedView from '@react-native-community/masked-view';
import { LinearGradient } from 'expo-linear-gradient';
import { StarFull, StarHalf, StarEmpty } from './icons/Star';
import { gradients } from '../../../constants/theme';

const StarsRating = ({
  rating, spacing, size, starStyle, containerStyle, text, textStyle,
}) => (
  <View style={containerStyle} pointerEvents="none">
    <Stars
      default={rating}
      count={5}
      half
      disabled
      starSize={100}
      spacing={spacing}
      fullStar={(
        <MaskedView
          maskElement={(
            <StarFull size={size} />
          )}
        >
          <LinearGradient
            colors={rating < 5 ? ['#FFC529', '#FFC529'] : gradients.orange.colors}
            start={[-0.35, 1]}
            end={[0.75, 1]}
            style={{ width: size, height: size }}
          />
        </MaskedView>
      )}
      halfStar={<StarHalf size={size} style={starStyle} />}
      emptyStar={<StarEmpty size={size} style={starStyle} color="#FFC529" />}
    />
    {text && (
      <Text style={textStyle}>
        {text}
      </Text>
    )}
  </View>
);

export default StarsRating;
