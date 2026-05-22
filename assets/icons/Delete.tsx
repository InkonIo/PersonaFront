import * as React from "react"
import Svg, { SvgProps, Rect, Path } from "react-native-svg"
const DeleteIcon = (props: SvgProps) => (
    <Svg
        width={28}
        height={28}
        fill="none"
        {...props}
    >
        <Rect width={28} height={28} fill="#FF5252" rx={14} />
        <Path
            stroke="#fff"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.33}
            d="M6.5 9h15M19.833 9v11.667c0 .833-.833 1.666-1.666 1.666H9.833c-.833 0-1.666-.833-1.666-1.666V9M10.667 9V7.333c0-.833.833-1.666 1.666-1.666h3.334c.833 0 1.666.833 1.666 1.666V9"
        />
    </Svg>
)
export default DeleteIcon
