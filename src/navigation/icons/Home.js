import * as React from 'react';
import Svg, { Path } from 'react-native-svg';
import {
    heightPercentageToDP as hp,
    widthPercentageToDP as wp,
} from 'react-native-responsive-screen';

const HomeIcon = (props) => {
    return (
        <Svg width={wp(6.7)} height={wp(6.7)} viewBox='0 0 26 26' {...props}>
            <Path
                d='M1.799 13.198h1.309V23c0 1.447.563 2.005 2.012 2.005h15.76c1.45 0 2.004-.558 2.004-2.005v-6.015-3.787h1.318c.531 0 1.039.005 1.211-.381.173-.386.093-1.06-.283-1.436L13.93.385a1.313 1.313 0 00-1.858 0L.861 11.38c-.375.375-.443 1.05-.273 1.436.17.386.68.38 1.211.38zM10.373 23v-5.558a1 1 0 011-1h3.254a1 1 0 011 1V23h-5.254zM13 2.556l7.88 7.87v6.016L20.882 23H17.64v-6.135c0-1.447-.564-2.427-2.013-2.427h-5.254c-1.448 0-2.011.98-2.011 2.427V23H5.12V10.426L13 2.556z'
                fill='#272D2F'
                fillRule='nonzero'
            />
        </Svg>
    )
}

const HomeFilledIcon = (props) => {
    return (
        <Svg width={wp(6.7)} height={wp(6.7)} viewBox='0 0 26 26' {...props}>
            <Path
                d='M3.108 13.198V23c0 1.447.563 2.005 2.012 2.005h4.264a1 1 0 001-1.001l-.007-6.756c0-.207 0-.547.336-.806.337-.26.594-.226.744-.226h3.223c.174 0 .363.04.601.226.238.185.349.467.349.653v6.91a1 1 0 001 1h4.25c1.45 0 2.004-.558 2.004-2.005v-6.015-3.787h1.318c.531 0 1.039.005 1.211-.381.173-.386.093-1.06-.283-1.436L13.93.385a1.313 1.313 0 00-1.858 0L.861 11.38c-.375.375-.443 1.05-.273 1.436.113.257.953.384 2.52.38z'
                fill='#272D2F'
                fillRule='evenodd'
            />
        </Svg>
    )
}

export { HomeIcon, HomeFilledIcon };