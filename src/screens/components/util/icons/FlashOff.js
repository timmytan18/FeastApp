import * as React from 'react';
import Svg, { Defs, G, Path } from 'react-native-svg';
import { wp } from '../../../../constants/theme';

const FlashOff = (props) => {
    return (
        <Svg width={wp(12.5)} height={wp(12.5)} viewBox='0 0 38 43' {...props}>
            <Defs></Defs>
            <G
                filter='url(#prefix__a)'
                transform='translate(9 9)'
                fill='#FFF'
                fillRule='nonzero'
            >
                <Path d='M18.222 21.695a1.039 1.039 0 001.472 0 1.04 1.04 0 000-1.473l-4.268-4.269 3.147-4.495a1.304 1.304 0 00-1.042-2.083H11.9l.937-7.92c.004-.03.006-.122.006-.153A1.302 1.302 0 0011.542 0c-.409 0-.798.196-1.065.553L6.27 6.797 1.778 2.305A1.04 1.04 0 10.306 3.778l17.916 17.917zM2.296 12.195c-.17.215-.264.481-.264.75 0 .689.593 1.25 1.32 1.25h4.665l-.963 8.62a1.306 1.306 0 00-.006.129c0 .689.593 1.25 1.32 1.25a1.36 1.36 0 001.071-.522l3.884-5.252-9.235-8.743-1.792 2.518z' />
            </G>
        </Svg>
    )
}

export default FlashOff;