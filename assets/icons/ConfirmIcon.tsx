import * as React from "react"
import Svg, { SvgProps, Rect, Path } from "react-native-svg"
const ConfirmIcon = (props: SvgProps) => (
    <Svg
        width={17}
        height={16}
        fill="none"
        {...props}
    >
        <Path
            stroke="#17412D"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.333}
            d="M8.5 14.667a6.667 6.667 0 1 0 0-13.333 6.667 6.667 0 0 0 0 13.333Z"
        />
        <Path
            stroke="#17412D"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.333}
            d="m6.5 8 1.333 1.333L10.5 6.667"
        />
    </Svg>
)
export default ConfirmIcon
