import React from 'react';
import { StyleSheet, View } from 'react-native';
import { colors, sizes, wp, hp } from '../../../constants/theme';

const Pagination = ({ length, index }) => {

    if (length == 1) {
        return null;
    }
    
    return (
        <View style={styles.container}>
            {[...Array(length)].map((e, i) =>
                <View style={[
                    styles.circle,
                    { backgroundColor: i == index ? colors.secondary : '#efefef' }]} 
                    key={i} 
                />)
            }
        </View>
    );
}

export default Pagination;

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: wp(6),
        alignSelf: 'center',
        flexDirection: 'row',
    },
    circle: {
        height: wp(2.2),
        width: wp(2.2),
        borderRadius: wp(2.2)/2,
        marginHorizontal: wp(1)
    }
});