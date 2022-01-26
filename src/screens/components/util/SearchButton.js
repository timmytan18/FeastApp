import React from 'react';
import { TouchableOpacity } from 'react-native';
import Search from './icons/Search';

const SearchButton = ({
  color, size, pressed, style,
}) => (
  <TouchableOpacity
    onPress={pressed}
    style={{
      height: size * 1.3, width: size * 1.3, alignItems: 'center', justifyContent: 'center',
    }}
  >
    <Search color={color} size={size} style={style} />
  </TouchableOpacity>
);

export default SearchButton;
