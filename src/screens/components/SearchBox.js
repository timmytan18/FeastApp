import React, { useState } from 'react';
import { StyleSheet, View, TextInput } from 'react-native';
import Search from './util/icons/Search';
import {
  colors, shadows, sizes, wp, hp,
} from '../../constants/theme';

const SearchBox = ({
  completeSearch, placeholder, autofocus, onChangeText,
}) => {
  const [query, setQuery] = useState(null);

  function onTextChanged(text) {
    setQuery(text);
  }

  return (
    <View style={styles.inputContainer}>
      <View style={styles.iconContainer}>
        <Search color={colors.tertiary} />
      </View>
      <TextInput
        style={styles.textInput}
        onChangeText={(text) => onTextChanged(text)}
        placeholder={placeholder}
        placeholderTextColor={`${colors.tertiary}70`}
        autoCapitalize="none"
        clearButtonMode="while-editing"
        value={query}
        returnKeyType="search"
        returnKeyLabel="search"
        autoFocus={autofocus}
        onSubmitEditing={() => {
          completeSearch(query);
        }}
        autoCorrect={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray2,
    borderRadius: sizes.radius * 1.5,
  },
  iconContainer: {
    flex: 0.1,
    height: wp(10.5),
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: wp(2),
  },
  textInput: {
    flex: 0.9,
    height: wp(10.5),
    marginLeft: wp(0.5),
    paddingTop: wp(0.2),
    fontFamily: 'Book',
    fontSize: sizes.h4,
    letterSpacing: 0.1,
  },
});

export default SearchBox;
