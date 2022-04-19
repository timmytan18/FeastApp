import React, { useState, useRef, useEffect } from 'react';

import {
  Modal,
  View,
  StyleSheet,
  Animated,
  Dimensions,
  PanResponder,
  TouchableWithoutFeedback,
  Easing,
} from 'react-native';

const { height } = Dimensions.get('window');

const SwipeDownModal = (props) => {
  const TIMING_CONFIG = {
    duration: 200,
    easing: Easing.inOut(Easing.ease),
  };

  const pan = useRef(new Animated.ValueXY()).current;

  const [isAnimating, setIsAnimating] = useState(
    !!props.DisableHandAnimation,
  );

  let animatedValueX = 0;
  let animatedValueY = 0;

  const closeModal = () => {
    setIsAnimating(true);
    Animated.timing(pan, {
      toValue: { x: 0, y: height },
      ...TIMING_CONFIG,
      useNativeDriver: false,
    }).start(() => {
      setIsAnimating(false);
      props.onClose();
    });
  };

  props.closeModalRef.current = closeModal;

  const openModal = () => {
    setIsAnimating(true);
    Animated.spring(pan, {
      toValue: 0,
      useNativeDriver: false,
    }).start(() => {
      setIsAnimating(false);
    });
  };

  const panResponder = useRef(
    PanResponder.create({
      // Ask to be the responder:
      onStartShouldSetPanResponder: () => (props.disableInnerScroll.current !== false),
      onMoveShouldSetPanResponder: (evt, gestureState) => !isAnimating && props.topReached.current,
      onPanResponderGrant: () => {
        pan.setOffset({
          x: animatedValueX,
          y: animatedValueY,
        });
        pan.setValue({ x: 0, y: 0 }); // Initial value
      },
      onPanResponderMove: (evt, gestureState) => {
        if (gestureState.dy > 0) {
          pan.setValue({ x: 0, y: gestureState.dy });
        }
      },
      onPanResponderRelease: (evt, gestureState) => {
        // The user has released all touches while this view is the
        // responder. This typically means a gesture has succeeded
        // Flatten the offset so it resets the default positioning
        if (gestureState.dy > 0 && gestureState.vy > 0) {
          if (props.topReached.current && (gestureState.vy >= 0.5 || gestureState.dy >= 100)) {
            closeModal();
          } else {
            openModal();
          }
        } else {
          openModal();
        }
      },
    }),
  ).current;

  useEffect(() => {
    if (props.modalVisible) {
      animatedValueX = 0;
      animatedValueY = 0;
      pan.setOffset({
        x: animatedValueX,
        y: animatedValueY,
      });
      pan.setValue({
        x: 0,
        y: height,
      }); // Initial value
      pan.x.addListener((value) => (animatedValueX = value.value));
      pan.y.addListener((value) => (animatedValueY = value.value));
    }
  }, [props.modalVisible]);

  const handleGetStyleBody = (opacity) => [
    [
      styles.background,
      {
        transform: [{ translateX: pan.x }, { translateY: pan.y }],
        opacity,
      },
    ],
    [props.ContentModalStyle],
  ];
  const handleMainBodyStyle = (opacity) => [
    [
      styles.ContainerModal,
      {
        opacity,
      },
    ],
    [props.MainContainerModal],
  ];

  const interpolateBackgroundOpacity = pan.y.interpolate({
    inputRange: [-height, -height / 2, 0, height / 2, height],
    outputRange: [0, 1, 1, 1, 0],
  });

  return (
    <Modal
      animationType="none"
      transparent
      visible={props.modalVisible}
      onShow={() => {
        setIsAnimating(true);
        Animated.timing(pan, {
          ...TIMING_CONFIG,
          toValue: { x: 0, y: 0 },
          useNativeDriver: false,
        }).start(() => {
          setIsAnimating(false);
        });
      }}
      onRequestClose={props.onRequestClose}
    >
      <Animated.View style={handleMainBodyStyle(interpolateBackgroundOpacity)}>
        <TouchableWithoutFeedback onPress={closeModal} style={{ flex: 1 }}>
          <View style={{ flex: 1 }} />
        </TouchableWithoutFeedback>
        <Animated.View
          style={handleGetStyleBody(interpolateBackgroundOpacity)}
          {...panResponder.panHandlers}
        >
          {props.ContentModal}
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  background: {
    opacity: 0,
    flex: 1,
    marginTop: 55,
  },
  container: {
    marginTop: 50,
    position: 'absolute',
    width: '100%',
  },
  ContainerModal: { backgroundColor: 'rgba(0, 0, 0, 0.3)', flex: 1 },
  ImageBackground: {
    width: '100%',
    height: '100%',
  },
  TouchWithoutFeedBack: { flex: 1 },
});

export default SwipeDownModal;
