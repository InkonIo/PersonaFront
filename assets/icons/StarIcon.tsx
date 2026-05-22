import * as React from "react"
import Svg, { SvgProps, Path } from "react-native-svg"
const StarIcon = (props: SvgProps) => (
    <Svg
        width={16}
        height={16}
        fill="none"
        {...props}
    >
        <Path
            stroke="#404040"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.333}
            d="m8 1.333 2.06 4.174 4.607.673-3.333 3.247.786 4.586L8 11.847l-4.12 2.166.787-4.586L1.334 6.18l4.606-.673L8 1.333Z"
        />
    </Svg>
)
export default StarIcon
