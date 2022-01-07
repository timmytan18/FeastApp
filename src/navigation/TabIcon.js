import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { colors, wp } from '../constants/theme';

const TabIcon = ({ icon, image, focused, size }) => {
    const width = size ? size : wp(7.2);
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
            {focused && <View style={[styles.image, image ? styles.circleBorder : styles.noImageFocused ]} />}
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
        width: wp(7.2),
        height: wp(7.2),
        borderRadius: wp(3.6)
    },
    imageFocused: {
        width: wp(5.7),
        height: wp(5.7),
        borderRadius: wp(2.85)
    },
    circleBorder: {
        position: 'absolute',
        borderWidth: 1.15,
        borderColor: colors.black,
    },
    noImageFocused: {
        position: 'absolute',
    }
});

export default TabIcon;