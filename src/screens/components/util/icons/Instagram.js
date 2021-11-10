import * as React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import Svg, { G, Rect, Path, Circle } from 'react-native-svg';
import {
    heightPercentageToDP as hp,
    widthPercentageToDP as wp,
} from 'react-native-responsive-screen';

const Instagram = ({ username }) => {

    const size = wp(7)+hp(1);

    return (
        <View style={{ opacity: 0.9, flex: 1, borderWidth: 1.5, borderRadius: wp(2), borderColor: '#E7EDF3', justifyContent: 'center', alignItems: 'center' }}>
            <Svg
                width={size}
                height={size}
                viewBox='0 0 33 33'
                xmlns='http://www.w3.org/2000/svg'
            >
                <G transform='translate(7 7)' fill='#272D2F' fillRule='nonzero'>
                    <Path d='M13.037 0h-7.7A5.344 5.344 0 000 5.338v7.7a5.344 5.344 0 005.338 5.337h7.7a5.344 5.344 0 005.337-5.338v-7.7A5.344 5.344 0 0013.037 0zm3.902 13.037a3.907 3.907 0 01-3.902 3.902h-7.7a3.907 3.907 0 01-3.901-3.902v-7.7a3.907 3.907 0 013.902-3.901h7.7a3.907 3.907 0 013.901 3.902v7.7z' />
                    <Path d='M9.188 4.235a4.958 4.958 0 00-4.953 4.952 4.958 4.958 0 004.952 4.953 4.958 4.958 0 004.953-4.953 4.958 4.958 0 00-4.953-4.952zm0 8.47A3.521 3.521 0 015.67 9.187 3.521 3.521 0 019.188 5.67a3.521 3.521 0 013.517 3.518 3.521 3.521 0 01-3.518 3.517z' />
                    <Circle cx={14.212} cy={4.163} r={1} />
                </G>
            </Svg>
        </View>
    )
}

export default Instagram;
