import * as React from 'react';
import Svg, { Defs, G, Path } from 'react-native-svg';
import { wp } from '../../../../constants/theme';

const FlipCam = (props) => {
    return (
        <Svg width={wp(13)} height={wp(13)} viewBox='0 0 49 43' {...props}>
            <Defs></Defs>
            <G
                filter='url(#prefix__a)'
                transform='matrix(0 1 1 0 9 9)'
                fill='#FFF'
                fillRule='nonzero'
            >
                <Path d='M15.297 12.5c.588.158.588-1.291 0-4.349a7.727 7.727 0 013.89 2.044c.347.341.663.715.937 1.114.276.399.513.826.706 1.272.196.453.347.925.446 1.407a7.347 7.347 0 01-1.153 5.707 7.414 7.414 0 01-.934 1.107c-.345.336 1.68 2.595 2.165 2.124a10.484 10.484 0 002.302-3.336c.277-.637.487-1.302.627-1.972.29-1.385.29-2.849 0-4.229a10.241 10.241 0 00-.628-1.974 10.237 10.237 0 00-.99-1.786 10.614 10.614 0 00-2.897-2.834 10.782 10.782 0 00-3.842-1.58c-.207-.043-.419-.065-.629-.095.672-3.231.672-4.771 0-4.62-.483.109-1.72 1.065-3.077 2.196-1.476 1.23-3.058 2.678-3.058 3.804 0 1.123 1.57 2.469 3.058 3.696 1.373 1.133 2.654 2.19 3.077 2.304zm-5.594 6c-.417.059-.417 1.508 0 4.348l-.012-.001a7.548 7.548 0 01-1.439-.438 7.689 7.689 0 01-2.439-1.608 7.607 7.607 0 01-.935-1.109 7.295 7.295 0 01-1.153-2.68 7.445 7.445 0 010-3.026c.099-.478.25-.95.446-1.405a7.535 7.535 0 011.642-2.385c.347-.34-1.682-2.597-2.169-2.121-.486.475-.928.999-1.31 1.552-.386.56-.72 1.16-.99 1.785a10.15 10.15 0 00-.626 1.973 10.378 10.378 0 000 4.227c.14.673.351 1.34.627 1.975a10.476 10.476 0 002.3 3.335 10.837 10.837 0 003.411 2.25c.644.267 1.323.472 2.018.612.207.04.419.064.63.094-.572 3.081-.572 4.622 0 4.622.615 0 1.581-.951 3.046-2.191 1.376-1.165 3.089-2.686 3.089-3.809 0-1.084-1.486-2.534-2.834-3.699-1.532-1.325-2.729-2.382-3.302-2.301z' />
            </G>
        </Svg>
    )
}

export default FlipCam;