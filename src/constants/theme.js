import { Platform } from 'react-native';

import {
  widthPercentageToDP,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

const isIOS = Platform.OS === 'ios';
const { isPad } = Platform;

const wp = isPad ? (size) => widthPercentageToDP(size * 0.5) : (size) => widthPercentageToDP(size);
const wpFull = (size) => widthPercentageToDP(size);

const colors = {
  accent: '#7928C0', // dark purple
  accent2: '#AF6CFF', // light purple
  primary: '#FE724C', // orange
  secondary: '#FFC529', // yellow
  tertiary: '#4A5B6D', // dark blue
  black: '#272D2F',
  white: '#fff',
  gray: '#B0BBC7',
  gray2: '#E7EDF3',
  gray3: '#D6DFE8',
  gray4: '#FAFBFB',
  lightBlue: 'rgba(174, 191, 229, 0.9)',
};

const shadows = {
  base: {
    shadowColor: '#c2c2c2', elevation: 2,
  },
  baseEven: {
    shadowColor: '#c2c2c2', elevation: 2,
  },
  darker: {
    shadowColor: '#272D2F', elevation: 3,
  },
  lighter: {
    shadowColor: '#B3C0CE', elevation: 1,
  },
  even: {
    shadowColor: '#B3C0CE', elevation: 2,
  },
};

const gradients = {
  orange: { colors: ['#FE724C', '#FFC529'], start: [0, 0], end: [1, 1] },
  purple: { colors: ['#7928C0', '#AF6CFF'], start: [0.2, 1], end: [0.8, 0] },
  gray: { colors: ['#4A5B6D', '#B0BBC7'], start: [-0.7, -0.7], end: [1.7, 1.7] },
};

const sizes = {
  // global sizes
  base: 16,
  font: 14,
  radius: 6,
  padding: 25,
  margin: isPad ? wp(16) : wp(4),

  // font sizes
  h1: wp(6.9), // 26
  h2: wp(5.8), // 22
  h3: wp(4.8), // 18
  h4: wp(4.5), // 17
  largeTitle: wp(9.6), // 36
  title: wp(8.8), // 33
  smallTitle: wp(6.6), // 30
  tinyTitle: wp(5.5),
  b0: wp(5.1),
  b1: wp(4.3), // 16
  b2: wp(4),
  b3: wp(3.8),
  b4: wp(3.3),
  caption: wp(3),
};

const header = {
  title: {
    fontFamily: 'Semi', fontSize: sizes.h3, color: colors.black, alignSelf: 'center', flex: 1,
  },
};

export {
  colors, shadows, gradients, sizes, header, wp, wpFull, hp, isIOS, isPad,
};
