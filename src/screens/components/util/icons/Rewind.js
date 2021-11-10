import * as React from 'react';
import Svg, { Path } from 'react-native-svg';
import {
    heightPercentageToDP as hp,
    widthPercentageToDP as wp,
} from 'react-native-responsive-screen';

const Rewind = (props) => {
    return (
        <Svg width={wp(4.8)} height={wp(4.8)} viewBox='0 0 18 18' {...props}>
            <Path
                d='M3.315 2.54L1.778.97a.526.526 0 00-.896.371L.07 6.9c0 .29.23.52.52.52l5.645-.597A.525.525 0 006.72 6.5c.082-.196.008-.317-.143-.467L5.035 4.444C6.33 3.413 8.086 3.44 9.352 3.44c3.862 0 5.908 3.11 5.908 5.912s-2.046 5.908-5.908 5.908c-1.87 0-3.433-1.015-4.971-1.99-.327-.207-.97-.023-1.26.39-.291.412-.37 1.04-.097 1.314 1.588 1.588 4.085 2.782 6.328 2.782 4.634 0 8.404-3.77 8.404-8.404S14.065.856 9.43.856C7.072.77 4.874 1.254 3.315 2.54z'
                fill='#4A5B6D'
                fillRule='nonzero'
            />
        </Svg>
    )
}

export default Rewind;