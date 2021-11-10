import * as React from 'react';
import Svg, {
    Defs,
    LinearGradient,
    Stop,
    G,
    Circle,
    Path,
} from 'react-native-svg';
import {
    heightPercentageToDP as hp,
    widthPercentageToDP as wp,
} from 'react-native-responsive-screen';

const Yum = (props) => {

    const { size } = props;

    return (
        <Svg width={size ? size : wp(7)} height={size ? size : wp(7)} viewBox='0 0 38 38' {...props}>
            <Defs>
                <LinearGradient
                    x1='100%'
                    y1='100%'
                    x2='15.426%'
                    y2='8.635%'
                    id='prefix__a'
                >
                    <Stop stopColor='#FE724C' offset='0%' />
                    <Stop stopColor='#FFC529' offset='100%' />
                    <Stop stopColor='#FFC529' offset='100%' />
                </LinearGradient>
            </Defs>
            <G transform='matrix(-1 0 0 1 38 0)' fill='none' fillRule='evenodd'>
                <Circle stroke='#FFF' strokeWidth={2} cx={19} cy={19} r={18} />
                <Path
                    d='M19 2C9.622 2 2 9.622 2 19s7.622 17 17 17 17-7.622 17-17S28.378 2 19 2zm.354 26.902c-.113.015-.24.015-.354.015-2.04 0-4.01-.539-5.723-1.545-.071-.028-.142-.07-.213-.113a11.619 11.619 0 01-3.81-3.712 1.067 1.067 0 01.311-1.459 1.058 1.058 0 011.473.312c.128.198.327.397.469.58.354.482 2.454 2.04 2.88 2.437-.137-.28-.27-.962-.402-2.043-.274-1.916.89-2.944 2.748-2.77 2.696.253 2.922 2.278 2.922 3.875 0 1.065.273 1.726.82 1.983 1.207-.183 1.553-.265 2.887-.844 1.345-.584 2.428-1.627 3.189-2.637.142-.184.283-.383.41-.581a1.058 1.058 0 011.474-.312c.482.312.623.978.312 1.46-2.097 3.258-5.596 5.241-9.393 5.355zm8.903-12.381c-.443 0-.585-.81-.783-1.205-.28-.556-.914-1.29-1.992-1.29-1.08 0-1.753.595-2.04 1.29-.273.658-.231 1.205-.744 1.205-.512 0-.604-.624-.604-1.205 0-1.955 1.326-3.4 3.281-3.4s3.494 1.445 3.494 3.4c0 .581-.17 1.205-.612 1.205zm-18.82.056c.443 0 .585-.81.783-1.204.28-.557.913-1.291 1.992-1.291 1.08 0 1.752.596 2.04 1.291.272.658.231 1.205.744 1.205.512 0 .604-.624.604-1.205 0-1.955-1.326-3.4-3.281-3.4s-3.494 1.445-3.494 3.4c0 .58.169 1.205.612 1.205z'
                    fill='url(#prefix__a)'
                />
            </G>
        </Svg>
    )
}

export default Yum;
