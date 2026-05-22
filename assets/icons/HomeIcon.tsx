import * as React from "react"
import Svg, { SvgProps, Path } from "react-native-svg"
const BookIcon = (props: SvgProps) => (
    <Svg
        width={21}
        height={20}
        fill="none"
        {...props}
    >
        <Path
            stroke="#17412D"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.333}
            d="M6 14.5h9m0-9s3 3.413 3 4.333v5.834c0 .92-.746 1.666-1.667 1.666H4.667c-.92 0-1.667-.746-1.667-1.666V9.833C3 8.913 6 5.5 6 5.5S9 2 10.5 2 15 5.5 15 5.5Z"
        />
    </Svg>
)
export default BookIcon
