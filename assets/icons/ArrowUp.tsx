import * as React from "react"
import Svg, { SvgProps, Path } from "react-native-svg"
const ArrowUp = (props: SvgProps) => (
    <Svg
        width={16}
        height={16}
        fill="none"
        {...props}
    >
        <Path
            stroke="#17412D"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.333}
            d="M8 12.667V3.333M3.333 8 8 3.333 12.667 8"
        />
    </Svg>
)
export default ArrowUp
