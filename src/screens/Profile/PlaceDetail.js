import React, { useState, useEffect } from 'react';
import {
  StyleSheet, ScrollView, View, TouchableOpacity,
} from 'react-native';
import PlaceDetailView from '../components/PlaceDetailView';
import BackArrow from '../components/util/icons/BackArrow';
import {
  colors, sizes, wp, shadows,
} from '../../constants/theme';

const PlaceDetail = ({ navigation, route }) => {
  const { place, placeName, placeId } = route.params;
  return (
    <ScrollView
      style={styles.scrollView}
      showsVerticalScrollIndicator={false}
    >
      <TouchableOpacity
        style={styles.downArrowContainer}
        onPress={() => navigation.goBack()}
        activeOpacity={0.75}
      >
        <View pointerEvents="none">
          <BackArrow
            color={colors.tertiary}
            size={wp(6)}
          />
        </View>
      </TouchableOpacity>
      <PlaceDetailView
        place={place}
        placeName={placeName}
        placeId={placeId}
        navigation={navigation}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    backgroundColor: '#fff',
  },
  downArrowContainer: {
    position: 'absolute',
    zIndex: 1,
    left: wp(4.5),
    top: wp(16),
    width: wp(15),
    height: wp(15),
    borderRadius: wp(7.5),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.gray2,
    opacity: 0.95,
    ...shadows.even,
  },
});

export default PlaceDetail;
