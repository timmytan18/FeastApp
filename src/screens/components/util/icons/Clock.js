import * as React from 'react';
import Svg, { Path } from 'react-native-svg';
import {
    heightPercentageToDP as hp,
    widthPercentageToDP as wp,
} from 'react-native-responsive-screen';

const Clock = (props) => {
    return (
        <Svg width={wp(9.6)} height={wp(9.6)} viewBox='0 0 36 36' {...props}>
            <Path
                d='M18 0C8.075 0 0 8.075 0 18s8.075 18 18 18 18-8.075 18-18S27.925 0 18 0zm5.927 26.473L16.2 18.745V7.2h3.6v10.055l6.673 6.672-2.546 2.546z'
                fill='#4A5B6D'
                fillRule='evenodd'
            />
        </Svg>
    )
}

export default Clock;