import React, {
  useContext,
} from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity, FlatList,
} from 'react-native';
import Modal from 'react-native-modal';
import { LinearGradient } from 'expo-linear-gradient';
import { Context } from '../../Store';
import Line from './util/Line';
import {
  colors, sizes, gradients, wp, wpFull,
} from '../../constants/theme';

const MoreItem = ({ item, setMorePressed, labelSize }) => (
  <View style={styles.moreItem}>
    <TouchableOpacity
      style={[
        styles.moreItemContainer,
        item.selected !== undefined && { justifyContent: 'space-between', marginLeft: wp(2), paddingRight: wp(5) },
      ]}
      onPress={() => {
        if (!item.keepModalOpen) setMorePressed(false);
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
      {item.selected !== undefined && (
        <View style={[
          styles.selectedContainer,
          item.selected && {
            height: wp(6),
            width: wp(6),
            borderRadius: wp(3),
          },
        ]}
        >
          {/* <View style={styles.selectedCenter} /> */}
          {item.selected && (
            <LinearGradient
              colors={gradients.orange.colors}
              start={gradients.orange.start}
              end={gradients.orange.end}
              style={styles.selectedCenter}
            />
          )}
        </View>
      )}
    </TouchableOpacity>
    {!item.end && <Line length={wpFull(100) - (wp(10))} color={colors.gray2} />}
  </View>
);

const MoreView = ({
  morePressed, setMorePressed, items, onDismiss, labelSize, onModalHide,
}) => {
  const [state] = useContext(Context);
  const height = Math.min(6, items.length) * styles.moreItem.height + wp(7);
  return (
    <Modal
      isVisible={morePressed}
      backdropOpacity={0.5}
      backdropTransitionOutTiming={0}
      onModalHide={onModalHide}
      onBackdropPress={() => {
        setMorePressed(false);
        if (onDismiss) {
          onDismiss();
        }
      }}
      deviceHeight={state.deviceHeight}
      style={{ margin: 0, justifyContent: 'flex-end' }}
    >
      <View style={[styles.moreContainer, { height }]}>
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
          contentContainerStyle={{ paddingTop: wp(2), paddingBottom: wp(5) }}
        />
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
    paddingLeft: wp(7),
  },
  moreText: {
    fontFamily: 'Medium',
    fontSize: sizes.b2,
    letterSpacing: 0.5,
    color: colors.black,
    paddingTop: wp(0.5),
  },
  selectedContainer: {
    height: wp(5.7),
    width: wp(5.7),
    borderRadius: wp(2.85),
    marginRight: wp(7),
    borderWidth: 2.5,
    borderColor: colors.gray3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedCenter: {
    height: wp(3.92),
    width: wp(3.92),
    borderRadius: wp(1.96),
    position: 'absolute',
    backgroundColor: colors.accent,
  },
});

export default MoreView;
