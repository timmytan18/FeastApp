import React, { useState, useEffect, useContext, useRef } from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, FlatList } from 'react-native';
import Modal from 'react-native-modal';
import Line from './util/Line';
import { colors, sizes, gradients, wp, hp, shadows } from '../../constants/theme';

const MoreView = ({ morePressed, setMorePressed, items }) => {

    const MoreItem = ({ item }) => {
        return (
            <View style={styles.moreItem}>
                <TouchableOpacity
                    style={styles.moreItemContainer}
                    onPress={() => {
                        setMorePressed(false)
                        item.onPress()
                    }}
                >
                    {item.icon}
                    <Text style={styles.moreText}>{item.label}</Text>
                </TouchableOpacity>
                {!item.end && <Line length={wp(100) - (sizes.margin * 2)} color={colors.gray2} />}
            </View>
        );
    }

    return (
        <Modal
            isVisible={morePressed}
            backdropOpacity={0.5}
            backdropTransitionOutTiming={0}
            onBackdropPress={() => setMorePressed(false)}
            style={{ margin: 0, justifyContent: 'flex-end' }}
        >
            <View style={[styles.moreContainer, { height: items.length * styles.moreItem.height }]}>
                <FlatList
                    data={items}
                    renderItem={({ item }) => <MoreItem item={item} />}
                    keyExtractor={item => item.label}
                    showsVerticalScrollIndicator={false}
                />
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    moreContainer: {
        width: '100%',
        alignContent: 'center',
        borderTopLeftRadius: wp(4),
        borderTopRightRadius: wp(4),
        backgroundColor: 'white',
    },
    moreItem: {
        height: hp(9),
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
        fontSize: sizes.b1,
        letterSpacing: 0.5,
        color: colors.black,
        paddingLeft: wp(5),
        paddingTop: wp(0.5)
    }
});

export default MoreView;