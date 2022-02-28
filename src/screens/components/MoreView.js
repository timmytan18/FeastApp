import React, {
  useState, useEffect, useContext, useRef,
} from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity, FlatList,
} from 'react-native';
import Modal from 'react-native-modal';
import { Context } from '../../Store';
import Line from './util/Line';
import {
  colors, sizes, gradients, wp, hp, shadows,
} from '../../constants/theme';

const MoreItem = ({ item, setMorePressed, labelSize }) => (
  <View style={styles.moreItem}>
    <TouchableOpacity
      style={styles.moreItemContainer}
      onPress={() => {
        setMorePressed(false);
        item.onPress();
      }}
      activeOpacity={0.7}
    >
      {item.icon}
      <Text
        style={[
          styles.moreText,
          { paddingLeft: item.icon ? wp(5) : wp(1) },
          labelSize && { fontSize: labelSize },
        ]}
      >
        {item.label}
      </Text>
    </TouchableOpacity>
    {!item.end && <Line length={wp(100) - (sizes.margin * 2)} color={colors.gray2} />}
  </View>
);

const MoreView = ({
  morePressed, setMorePressed, items, onDismiss, labelSize, onModalHide,
}) => {
  const [state] = useContext(Context);
  return (
    <Modal
      isVisible={morePressed}
      backdropOpacity={0.5}
      backdropTransitionOutTiming={0}
      onModalHide={onModalHide && onModalHide}
      onBackdropPress={() => {
        setMorePressed(false);
        if (onDismiss) {
          onDismiss();
        }
      }}
      deviceHeight={state.deviceHeight}
      style={{ margin: 0, justifyContent: 'flex-end' }}
    >
      <View style={[
        styles.moreContainer,
        { height: items.length * styles.moreItem.height + wp(7) },
      ]}
      >
        <FlatList
          data={items}
          renderItem={({ item }) => (
            <MoreItem
              item={item}
              setMorePressed={setMorePressed}
              labelSize={labelSize}
            />
          )}
          keyExtractor={(item) => item.label}
          showsVerticalScrollIndicator={false}
        />
        <View style={styles.bottomMargin} />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  moreContainer: {
    width: '100%',
    alignContent: 'center',
    borderTopLeftRadius: wp(4),
    borderTopRightRadius: wp(4),
    backgroundColor: '#fff',
  },
  moreItem: {
    height: wp(17),
    width: '100%',
    alignContent: 'center',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  moreItemContainer: {
    width: '100%',
    height: '100%',
    flexDirection: 'row',
    alignSelf: 'flex-start',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingLeft: sizes.margin + wp(3),
  },
  moreText: {
    fontFamily: 'Medium',
    fontSize: sizes.b2,
    letterSpacing: 0.5,
    color: colors.black,
    paddingTop: wp(0.5),
  },
});

export default MoreView;
