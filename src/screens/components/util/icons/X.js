import * as React from 'react';
import Svg, { Path } from 'react-native-svg';
import {
    heightPercentageToDP as hp,
    widthPercentageToDP as wp,
} from 'react-native-responsive-screen';

const X = (props) => {
    const { size, color } = props;
    return (
        <Svg width={size ? size: wp(8.8)} height={size ? size : wp(8.8)} viewBox='0 0 32 32' {...props}>
            <Path
                d='M21.834 8.222L16 14.055l-5.834-5.833c-.648-.648-1.296-.648-1.944 0-.648.648-.648 1.296 0 1.944L14.055 16l-5.833 5.834c-.648.648-.648 1.296 0 1.944.648.648 1.296.648 1.944 0L16 17.945l5.834 5.833c.648.648 1.296.648 1.944 0 .648-.648.648-1.296 0-1.944L17.945 16l5.833-5.834c.648-.648.648-1.296 0-1.944-.648-.648-1.296-.648-1.944 0z'
                fill={color ? color : '#4A5B6D'}
                fillRule='nonzero'
            />
        </Svg>
    )
}

export default X;
