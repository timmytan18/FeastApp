import React, { useRef } from 'react';
import { View, PanResponder } from 'react-native';
import StarsRating from './util/StarsRating';

const EditStarsRating = ({
  rating, updateRating, spacing, size, starStyle, containerStyle,
}) => {
  const containerWidth = spacing * 5 + size * 5;

  const startX = useRef(0);
  const movementType = useRef('');

  const getRatingInput = (x, roundToHalf) => {
    let ratingInput = Math.round((x / containerWidth) * 5);
    if (roundToHalf) ratingInput = Math.round((x / containerWidth) * 5 * 2) / 2;
    return Math.max(0, Math.min(5, ratingInput));
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderStart: (event) => {
        movementType.current = 'tap';
        startX.current = event.nativeEvent.locationX;
        updateRating(getRatingInput(event.nativeEvent.locationX, false));
      },
      onPanResponderMove: (_, gestureState) => {
        movementType.current = 'swipe';
        updateRating(getRatingInput(startX.current + gestureState.dx, true));
      },
    }),
  ).current;

  return (
    <View {...panResponder.panHandlers}>
      <StarsRating
        rating={rating}
        spacing={spacing}
        size={size}
        starStyle={starStyle}
        containerStyle={containerStyle}
      />
    </View>
  );
};

export default EditStarsRating;
