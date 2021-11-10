import * as React from 'react';
import Svg, { G, Path } from 'react-native-svg';
import {
    heightPercentageToDP as hp,
    widthPercentageToDP as wp,
} from 'react-native-responsive-screen';

const OrderNull = (props) => {
    return (
        <Svg
            width={wp(10)}
            height={wp(10)}
            viewBox="0 0 31 33"
            xmlns="http://www.w3.org/2000/svg"
            {...props}
        >
            <G fill="none" fillRule="evenodd">
                <Path fill="#E7EDF3" d="M0 6h31v27H0z" />
                <G fill="#B0BBC7">
                    <Path d="M17.582 13.345l-.05.011c-.37.09-.635.182-.793.273-.247.143-.413.286-.536.573-.124.286-.088.273-.161.58a2.48 2.48 0 01-.25.638l.139-.066c.223-.107.37-.18.438-.22.07-.04.41-.237.491-.305.081-.068.225-.18.347-.311.097-.105.215-.255.294-.401.08-.147.094-.313.098-.35a1.4 1.4 0 00-.017-.422z" />
                    <Path d="M21.066 10.297l-.068.155c-.736 1.652-1.229 2.545-1.882 3.448-.653.903-1.29 1.676-2.093 2.3-.804.623-1.453 1.07-1.946 1.341a2.667 2.667 0 01-.117-.781 4.39 4.39 0 01.109-.928l-.045.05c-.623.69-1.023 1.243-1.201 1.658l-.007.014c-.178.427-.219 1.194-.12 2.303 0 .181-.542.34-1.231.505-.625.149-1.375.29-2.25.422.35.047.615.047 1.112.047.771 0 1.71.014 2.372-.24.707-.27 1.585-.814 2.632-1.632l.36-.305c.323-.275.594-.508.814-.7.445-.389 1.624-1.636 2.029-2.18l.034-.047c.197-.272.52-.765.966-1.48l-.018.046a6.026 6.026 0 01-.2.45l-.031.06c-.097.19-.241.494-.433.815a10.818 10.818 0 01-1.076 1.42l-.313.335c-.265.282-.533.563-.831.848-.629.6-.915.88-1.528 1.321-.315.228-.586.452-.94.66-.332.197-.701.39-1.25.665h2.11c.97-.001 1.536-.027 1.94-.1.402-.072.745-.152 1.196-.405.323-.181.585-.407.785-.679-.119.064-.38.122-.785.174l-.044.006c-.381.046-.642.044-.782-.006l.058-.043c.752-.56 1.099-.765 1.655-1.314.326-.322.655-.77.9-1.238a7.17 7.17 0 00.473-1.21c.334-1.31.278-2.43.235-3.112-.043-.683-.21-1.478-.589-2.643zM15.57 26.703c4.407 0 5.54-2.685 5.897-4.523.356-1.837.928-.551-5.96-.551-6.84 0-6.346-1.232-5.977.551.369 1.783 1.633 4.523 6.04 4.523z" />
                </G>
                <Path
                    d="M22.875 0a4.125 4.125 0 014.12 3.92l.005.205V33h-4.286V3.515H8.286V33H4V4.125A4.125 4.125 0 018.125 0h14.75z"
                    fill="#D6DFE8"
                    fillRule="nonzero"
                />
            </G>
        </Svg>
    )
}

export default OrderNull;