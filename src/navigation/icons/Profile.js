import * as React from 'react'
import Svg, { G, Path } from 'react-native-svg'
import {
    heightPercentageToDP as hp,
    widthPercentageToDP as wp,
} from 'react-native-responsive-screen';

const ProfileIcon = (props) => {
    const { size } = props;
    return (
        <Svg width={size ? size : wp(6.4)} height={size ? size : wp(6.4)} viewBox="0 0 20 20" {...props}>
            <G fill="none" fillRule="evenodd">
                <Path d="M10 6c-1.178 0-2 .822-2 2s.822 2 2 2 2-.822 2-2-.822-2-2-2z" />
                <Path d="M10 12c-2.28 0-4-1.72-4-4 0-2.28 1.72-4 4-4 2.28 0 4 1.72 4 4 0 2.28-1.72 4-4 4z" />
                <Path
                    d="M10 0C4.579 0 0 4.579 0 10c0 3.189 1.592 6.078 4 7.924l.102.076C5.77 19.245 7.813 20 10 20s4.23-.755 5.898-2l.102-.076c2.408-1.846 4-4.734 4-7.924 0-5.421-4.579-10-10-10zM5.528 17.097C5.825 15.752 7.568 14 9 14h2c1.432 0 3.368 1.753 3.665 3.097C13.497 17.774 11.67 18.5 10 18.5s-3.304-.726-4.472-1.403zM15.89 16.05c-.757-1.8-2.818-3.477-4.89-3.477H9.042c-2.072 0-4.043 1.678-4.799 3.477C2.776 14.591 1.5 13.176 1.5 10c0-4.59 3.91-8.5 8.5-8.5s8.5 3.91 8.5 8.5c0 3.176-1.143 4.591-2.61 6.05z"
                    fill="#272D2F"
                    fillRule="nonzero"
                />
                <Path
                    d="M10 4.1C7.82 4.1 6.1 5.82 6.1 8c0 2.18 1.72 3.9 3.9 3.9 2.18 0 3.9-1.72 3.9-3.9 0-2.18-1.72-3.9-3.9-3.9zm0 6.4c-1.43 0-2.5-1.07-2.5-2.5S8.57 5.5 10 5.5s2.5 1.07 2.5 2.5-1.07 2.5-2.5 2.5z"
                    fill="#272D2F"
                    fillRule="nonzero"
                />
            </G>
        </Svg>
    )
}

export default ProfileIcon;