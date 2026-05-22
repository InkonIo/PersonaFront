import * as React from "react"
import Svg, { SvgProps, Path } from "react-native-svg"
const ArrowDown = (props: SvgProps) => (
    <Svg
        width={16}
        height={16}
        fill="none"
        {...props}
    >
        <Path
            stroke="#FF5252"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.333}
            d="M8 3.333v9.334M12.667 8 8 12.667 3.333 8"
        />
    </Svg>
)
export default ArrowDown
