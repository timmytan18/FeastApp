import * as React from 'react';
import Svg, { Defs, G, Path } from 'react-native-svg';
import { wp } from '../../../../constants/theme';

const Flash = (props) => {
    return (
        <Svg width={wp(12.5)} height={wp(12.5)} viewBox='0 0 35 43' {...props}>
            <Defs></Defs>
            <G
                filter='url(#prefix__a)'
                transform='translate(9 9)'
                fill='#FFF'
                fillRule='nonzero'
            >
                <Path d='M9.542 0c.717 0 1.302.585 1.3 1.302 0 .03-.001.123-.005.153L9.9 9.375h5.631a1.304 1.304 0 011.042 2.083l-3.25 4.414.005.007-1.939 2.612-.002-.002-3.948 5.183a1.36 1.36 0 01-.933.515l-.137.007c-.728 0-1.32-.561-1.32-1.25 0-.026 0-.103.005-.13l.963-8.62H1.352c-.727 0-1.32-.56-1.32-1.249 0-.269.094-.535.264-.75l1.792-2.518 2.09-2.958-.004-.003L8.477.553A1.325 1.325 0 019.542 0z' />
            </G>
        </Svg>
    )
}

export default Flash;