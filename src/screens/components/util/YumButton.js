import React, { useState, useRef } from 'react';
import { StyleSheet, View, TouchableOpacity, Text } from 'react-native';
import Yum from './icons/Yum';
import YumNoFill from './icons/YumNoFill';
import { colors, shadows, sizes, wp, hp } from '../../../constants/theme';

const YumButton = ({ client, activityId, reacts }) => {

    const [pressed, setPressed] = useState(false);
    const reactionId = useRef(null);

    const [yumCount, setYumCount] = useState(reacts.yum ? reacts.yum : 0);

    const reactPressed = async () => {
        if (pressed) {
            await client.reactions.delete(reactionId.current);
            reactionId.current = null;
            setYumCount(yumCount-1)
        } else {
            const { id } = await client.reactions.add('yum', activityId);
            reactionId.current = id;
            setYumCount(yumCount+1)
        }
        setPressed(!pressed)
        console.log(reactionId.current)
    }

    const fillYum = <Yum size={wp(13)} />;
    const noFillYum = <YumNoFill size={wp(13)} />;

    return (
        <View style={styles.reactsContainer}>
            <TouchableOpacity style={{ width: '100%' }} activeOpacity={0.9} onPress={reactPressed}>
                {pressed ? fillYum : noFillYum}
            </TouchableOpacity>
            <Text style={styles.reactsText}>{yumCount} Yums</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    reactsContainer: {
        alignSelf: 'flex-end',
        alignItems: 'center',
        justifyContent: 'center'
    },
    reactsText: {
        fontFamily: 'Book',
        fontSize: sizes.b3,
        color: colors.white,
        paddingTop: wp(1)
    },
});

export default YumButton;