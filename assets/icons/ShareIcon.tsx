import * as React from "react"
import Svg, { SvgProps, Rect, Path } from "react-native-svg"
const ShareIcon = (props: SvgProps) => (
    <Svg
        width={28}
        height={28}
        fill="none"
        {...props}
    >
        <Rect width={28} height={28} fill="#F3F4F6" rx={14} />
        <Path
            stroke="#404040"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.333}
            d="M19 10.667a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM9 16.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM19 22.333a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM11.158 15.258l5.692 3.317M16.842 9.425l-5.684 3.317"
        />
    </Svg>
)
export default ShareIcon
