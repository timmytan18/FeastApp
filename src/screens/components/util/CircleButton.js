import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import Rewind from './icons/Rewind';
import X from './icons/X';
import Heart from './icons/Heart';
import Yelp from './icons/Yelp';
import ThreeDots from './icons/ThreeDots';
import { colors, shadows, sizes, wp, hp } from '../../../constants/theme';

const cbIcons = {
    rewind: <Rewind />,
    x: <X />,
    heart: <Heart style={{ marginTop: 1 }} />,
    yelp: <Yelp />,
    dots: <ThreeDots />
}

const CircleButton = ({ icon, size, color, pressed }) => {
    return (
        <TouchableOpacity
            style={[styles.container, shadows.base, {
                backgroundColor: color,
                width: size,
                borderRadius: size/2,
            }]}
            activeOpacity={0.6}
            onPress={pressed}
        >
            {icon}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        aspectRatio: 1,
        alignItems: 'center',
        justifyContent: 'center',
    }
});

export { CircleButton, cbIcons };