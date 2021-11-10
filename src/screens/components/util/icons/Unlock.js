import * as React from 'react';
import Svg, { Path } from 'react-native-svg';
import {
    heightPercentageToDP as hp,
    widthPercentageToDP as wp,
} from 'react-native-responsive-screen';

const Unlock = (props) => {
    return (
        <Svg width={wp(4.4)} height={wp(5.6)} viewBox='0 0 16 20' {...props}>
            <Path
                d='M8 2c1.654 0 3 1.346 3 3h2c0-2.757-2.243-5-5-5S3 2.243 3 5v2H2C.897 7 0 7.897 0 9v9c0 1.103.897 2 2 2h12c1.103 0 2-.897 2-2V9c0-1.103-.897-2-2-2H5V5c0-1.654 1.346-3 3-3zm6.002 16H9v-2.278c.595-.347 1-.985 1-1.722 0-1.103-.897-2-2-2s-2 .897-2 2c0 .736.405 1.375 1 1.722V18H2V9h12l.002 9z'
                fill='#44566C'
                fillRule='nonzero'
            />
        </Svg>
    );
}

export default Unlock;