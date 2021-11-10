import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { colors, wp } from '../constants/theme';

const TabIcon = ({ icon, image, focused, size }) => {
    const width = size ? size : wp(6.7);
    const imageStyle = focused ?
        styles.imageFocused :
        [styles.image, { width: width, height: width }];

    return (
        <View style={styles.container}>
            {image ?
                <Image
                    source={{ uri: image }}
                    resizeMode="cover"
                    style={imageStyle}
                />
                : icon
            }
            {focused && <View style={[styles.image, styles.circleBorder]} />}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignContent: 'center',
        alignItems: 'center',
        justifyContent: 'center',
    },
    image: {
        width: wp(6.7),
        height: wp(6.7),
        borderRadius: wp(3.35)
    },
    imageFocused: {
        width: wp(5),
        height: wp(5),
        borderRadius: wp(2.5)
    },
    circleBorder: {
        position: 'absolute',
        borderWidth: 1,
        borderColor: colors.black,
    }
});

export default TabIcon;