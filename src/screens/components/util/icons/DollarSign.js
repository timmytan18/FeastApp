import * as React from 'react';
import Svg, { Path } from 'react-native-svg';
import {
    heightPercentageToDP as hp,
    widthPercentageToDP as wp,
} from 'react-native-responsive-screen';

const DollarSign = (props) => {
    return (
        <Svg width={wp(5)} height={wp(5)} viewBox='0 0 18 18' {...props}>
            <Path
                d='M9 0c4.95 0 9 4.04 9 9s-4.04 9-9 9-9-4.04-9-9 4.05-9 9-9zm.675 3.61h-1.35v.967C6.551 4.874 5.4 6.04 5.4 7.2c0 1.008.468 2.475 3.6 2.475 1.8 0 1.8.297 1.8 1.125 0 .828-.558 1.35-1.8 1.35-1.657 0-2.24-1.221-2.25-1.35H5.4c0 .826.82 2.298 2.925 2.628v.972h1.35v-.977c1.774-.297 2.475-1.464 2.475-2.623 0-1.008-.219-2.475-3.15-2.475-1.62 0-2.25-.243-2.25-1.125S7.605 5.85 9 5.85c1.296 0 1.697 1.024 1.71 1.366l.678-.016h.672c0-.923-.824-2.222-2.385-2.591V3.61z'
                fill='#272D2F'
                fillRule='nonzero'
                fillOpacity={0.9}
            />
        </Svg>
    )
}

export default DollarSign;