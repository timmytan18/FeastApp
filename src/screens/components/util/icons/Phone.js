import * as React from 'react';
import Svg, { G, Rect, Path } from 'react-native-svg';

const Phone = (props) => {
  return (
    <Svg
      width={17}
      height={22}
      viewBox='0 0 17 22'
      xmlns='http://www.w3.org/2000/svg'
      {...props}
    >
      <G stroke='#44566C' fill='none' fillRule='evenodd'>
        <Rect
          strokeWidth={2.142}
          x={1.071}
          y={1.071}
          width={13.923}
          height={19.278}
          rx={2.142}
        />
        <Path strokeWidth={1.5} strokeLinecap='square' d='M2.5 15.81h11' />
        <Path strokeWidth={1.7} strokeLinecap='square' d='M2.5 4.81h11' />
        <Path strokeWidth={0.857} strokeLinecap='round' d='M7.14 17.85h2.04' />
      </G>
    </Svg>
  )
}

export default Phone;