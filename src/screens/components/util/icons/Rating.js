import * as React from 'react';
import Svg, {
  Path, Defs, LinearGradient, Stop,
} from 'react-native-svg';

const Rating = (props) => {
  const { isGradient, color, size } = props;
  if (isGradient) {
    return (
      <Svg
        width={size || 38}
        height={size || 38}
        viewBox="0 0 38 38"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        {...props}
      >
        <Path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M34.2 11.4c0 .329-.023.66-.067.99A7.595 7.595 0 0 1 38 19a7.595 7.595 0 0 1-3.867 6.61c.044.33.067.661.067.99 0 4.52-4.072 8.138-8.59 7.533A7.59 7.59 0 0 1 19 38a7.59 7.59 0 0 1-6.61-3.867C7.862 34.738 3.8 31.12 3.8 26.6c0-.329.023-.66.067-.99A7.595 7.595 0 0 1 0 19a7.595 7.595 0 0 1 3.866-6.61 7.555 7.555 0 0 1-.066-.99c0-4.52 4.062-8.147 8.59-7.534A7.59 7.59 0 0 1 19 0a7.59 7.59 0 0 1 6.61 3.866c4.518-.613 8.59 3.014 8.59 7.534Z"
          fill="url(#a)"
        />
        <Defs>
          <LinearGradient
            id="a"
            x1={-18.984}
            y1={18.984}
            x2={18.984}
            y2={56.952}
            gradientUnits="userSpaceOnUse"
          >
            <Stop stopColor="#FE724C" />
            <Stop offset={1} stopColor="#FFC529" />
          </LinearGradient>
        </Defs>
      </Svg>
    );
  }
  return (
    <Svg
      width={size || 38}
      height={size || 38}
      viewBox="0 0 38 38"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M34.2 11.4c0 .329-.023.66-.067.99A7.595 7.595 0 0 1 38 19a7.595 7.595 0 0 1-3.867 6.61c.044.33.067.661.067.99 0 4.52-4.072 8.138-8.59 7.533A7.59 7.59 0 0 1 19 38a7.59 7.59 0 0 1-6.61-3.867C7.862 34.738 3.8 31.12 3.8 26.6c0-.329.023-.66.067-.99A7.595 7.595 0 0 1 0 19a7.595 7.595 0 0 1 3.866-6.61 7.555 7.555 0 0 1-.066-.99c0-4.52 4.062-8.147 8.59-7.534A7.59 7.59 0 0 1 19 0a7.59 7.59 0 0 1 6.61 3.866c4.518-.613 8.59 3.014 8.59 7.534Z"
        fill={color || '#4A5B6D'}
      />
    </Svg>
  );
};

export default Rating;
