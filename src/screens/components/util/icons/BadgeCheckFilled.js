import * as React from 'react';
import Svg, { Defs, LinearGradient, Stop, Path } from 'react-native-svg';
import {
    heightPercentageToDP as hp,
    widthPercentageToDP as wp,
} from 'react-native-responsive-screen';

const BadgeCheckFilled = (props) => {
    return (
        <Svg width={wp(10.4)} height={wp(10.4)} viewBox='0 0 38 38' {...props}>
            <Defs>
                <LinearGradient
                    x1='0%'
                    y1='0%'
                    x2='99.916%'
                    y2='99.916%'
                    id='prefix__a'
                >
                    <Stop stopColor='#FE724C' offset='0%' />
                    <Stop stopColor='#FFC529' offset='100%' />
                </LinearGradient>
            </Defs>
            <Path
                d='M329.134 348.39c.043-.33.066-.661.066-.99 0-4.52-4.072-8.147-8.59-7.534A7.59 7.59 0 00314 336a7.59 7.59 0 00-6.61 3.866c-4.528-.613-8.59 3.014-8.59 7.534 0 .329.023.66.066.99A7.595 7.595 0 00295 355a7.595 7.595 0 003.866 6.61c-.043.33-.066.661-.066.99 0 4.52 4.062 8.138 8.59 7.534A7.59 7.59 0 00314 374a7.59 7.59 0 006.61-3.866c4.518.604 8.59-3.014 8.59-7.534 0-.329-.023-.66-.066-.99A7.595 7.595 0 00333 355a7.595 7.595 0 00-3.866-6.61zm-17.12 15l-6.967-7.056 2.706-2.668 4.288 4.344 8.221-8.159 2.676 2.698-10.923 10.841z'
                transform='translate(-295 -336)'
                fill='url(#prefix__a)'
                fillRule='evenodd'
            />
        </Svg>
    )
}

export default BadgeCheckFilled;