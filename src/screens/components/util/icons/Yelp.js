import React from 'react';
import { StyleSheet } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import {
    heightPercentageToDP as hp,
    widthPercentageToDP as wp,
} from 'react-native-responsive-screen';

const Yelp = ({ color }) => {
    return (
        <FontAwesome name={'yelp'} style={[styles.yelpIcon, { color: color ? color : '#f44336' }]} />
    );
}

export default Yelp;

const styles = StyleSheet.create({
    yelpIcon: {
        fontSize: wp(8),
        marginLeft: wp(0.5),
        marginBottom: wp(0.5),
        color: '#f44336',
    },
})

