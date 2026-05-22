import * as React from "react"
import Svg, { SvgProps, Rect, Path } from "react-native-svg"
const ArrowLeft = (props: SvgProps) => (
    <Svg
        width={28}
        height={28}
        fill="none"
        {...props}
    >
        <Rect width={28} height={28} fill="#F3F4F6" rx={14} />
        <Path
            stroke="#1F2937"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.333}
            d="M19.833 14H8.167M14 19.833 8.167 14 14 8.167"
        />
    </Svg>
)
export default ArrowLeft
