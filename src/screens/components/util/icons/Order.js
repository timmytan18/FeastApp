import * as React from 'react';
import Svg, { Defs, LinearGradient, Stop, G, Path } from 'react-native-svg';
import {
    heightPercentageToDP as hp,
    widthPercentageToDP as wp,
} from 'react-native-responsive-screen';

const Order = (props) => {

    const { size } = props;

    return (
        <Svg
            width={size ? size : wp(10)}
            height={size ? size : wp(10)}
            viewBox='0 0 31 33'
            xmlns='http://www.w3.org/2000/svg'
            {...props}
        >
            <Defs>
                <LinearGradient x1='50%' y1='0%' x2='50%' y2='98.725%' id='prefix__b'>
                    <Stop stopColor='#F2C94C' offset='0%' />
                    <Stop stopColor='#F2994A' offset='100%' />
                </LinearGradient>
                <LinearGradient
                    x1='104.243%'
                    y1='-3.278%'
                    x2='10.796%'
                    y2='129.583%'
                    id='prefix__c'
                >
                    <Stop stopColor='#FFC529' offset='0%' />
                    <Stop stopColor='#F2C64C' offset='44.053%' />
                    <Stop stopColor='#FE724C' offset='100%' />
                </LinearGradient>
                <LinearGradient x1='50%' y1='0%' x2='50%' y2='98.623%' id='prefix__d'>
                    <Stop stopColor='#666' offset='0%' />
                    <Stop stopColor='#272D2F' offset='99.908%' />
                </LinearGradient>
            </Defs>
            <G fill='none' fillRule='evenodd'>
                <Path fill='#AF6CFF' d='M0 6h31v27H0z' />
                <G transform='translate(5 8)' filter='url(#prefix__a)'>
                    <Path
                        d='M8.275 3.048l-.049.012c-.37.09-.635.18-.793.272-.248.143-.413.287-.537.573-.123.287-.087.273-.16.581a2.48 2.48 0 01-.251.637l.14-.066c.222-.107.369-.18.438-.22.069-.04.41-.237.49-.305.081-.068.226-.179.348-.311.096-.105.215-.255.294-.401.079-.147.093-.313.097-.35a1.4 1.4 0 00-.017-.422z'
                        fill='url(#prefix__b)'
                        transform='translate(4.307 2.297)'
                    />
                    <Path
                        d='M11.76 0l-.07.155c-.735 1.652-1.227 2.545-1.88 3.448-.654.903-1.29 1.676-2.094 2.3-.804.623-1.453 1.07-1.946 1.341a2.667 2.667 0 01-.116-.78 4.39 4.39 0 01.108-.93l-.044.05c-.624.691-1.024 1.244-1.202 1.659l-.006.014c-.179.427-.22 1.194-.121 2.303 0 .181-.542.341-1.231.505-.624.15-1.374.29-2.25.423.35.046.616.046 1.112.046.771 0 1.711.014 2.373-.24.707-.27 1.584-.814 2.632-1.632l.36-.305c.322-.275.594-.508.813-.7.445-.388 1.624-1.636 2.03-2.18l.033-.046c.198-.272.52-.766.967-1.48l-.019.045a6.026 6.026 0 01-.2.45l-.031.06c-.096.19-.241.494-.432.815a10.818 10.818 0 01-1.077 1.42l-.313.335c-.264.282-.533.563-.831.848-.628.6-.915.88-1.527 1.322-.316.227-.587.452-.94.66-.333.196-.702.389-1.252.664h2.112c.97-.001 1.536-.027 1.939-.1.403-.072.745-.152 1.196-.405.324-.18.585-.407.785-.679-.119.064-.38.123-.785.174l-.044.006c-.38.046-.641.044-.782-.006l.058-.043c.753-.56 1.1-.765 1.655-1.314.326-.322.655-.77.9-1.238a7.17 7.17 0 00.473-1.21c.335-1.31.278-2.43.235-3.112-.043-.683-.21-1.478-.588-2.643z'
                        fill='url(#prefix__c)'
                        transform='translate(4.307 2.297)'
                    />
                    <Path
                        d='M6.263 16.406c4.407 0 5.541-2.685 5.897-4.523.356-1.837.928-.551-5.96-.551-6.84 0-6.346-1.232-5.977.551.37 1.784 1.633 4.523 6.04 4.523z'
                        fill='url(#prefix__d)'
                        transform='translate(4.307 2.297)'
                    />
                </G>
                <Path
                    d='M22.875 0a4.125 4.125 0 014.12 3.92l.005.205V33h-4.286V3.515H8.286V33H4V4.125A4.125 4.125 0 018.125 0h14.75z'
                    fill='#272D2F'
                    fillRule='nonzero'
                />
            </G>
        </Svg>
    )
}

export default Order;
