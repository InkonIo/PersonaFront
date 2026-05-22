import * as React from "react"
import Svg, { SvgProps, Rect, Path } from "react-native-svg"
const BookIcon = (props: SvgProps) => (
    <Svg
        width={28}
        height={28}
        fill="none"
        {...props}
    >
        <Rect width={28} height={28} fill="#ffffff" rx={14} />
        <Path
            stroke="#404040"
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M22.75 9.113c-1.458-.908-2.917-1.363-4.375-1.363-1.458 0-2.917.455-4.375 1.363V21.5c1.458-.834 2.917-1.25 4.375-1.25 1.458 0 2.917.416 4.375 1.25V9.113Z"
            clipRule="evenodd"
        />
        <Path
            stroke="#404040"
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M20.623 10.61a7.334 7.334 0 0 0-2.248-.36c-.75 0-1.499.12-2.25.36m4.498 2.5a7.334 7.334 0 0 0-2.248-.36c-.75 0-1.499.12-2.25.36m4.498 2.5a7.334 7.334 0 0 0-2.248-.36c-.75 0-1.499.12-2.25.36m4.498 2.5a7.334 7.334 0 0 0-2.248-.36c-.75 0-1.499.12-2.25.36m-4.252-7.5a7.34 7.34 0 0 0-2.248-.36c-.75 0-1.499.12-2.25.36m4.498 2.5a7.34 7.34 0 0 0-2.248-.36c-.75 0-1.499.12-2.25.36m4.498 2.5a7.334 7.334 0 0 0-2.248-.36c-.75 0-1.499.12-2.25.36m4.498 2.5a7.334 7.334 0 0 0-2.248-.36c-.75 0-1.499.12-2.25.36"
        />
        <Path
            stroke="#404040"
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M14 9.113c-1.458-.908-2.917-1.363-4.375-1.363-1.458 0-2.917.455-4.375 1.363V21.5c1.458-.834 2.917-1.25 4.375-1.25 1.458 0 2.917.416 4.375 1.25V9.113Z"
            clipRule="evenodd"
        />
    </Svg>
)
export default BookIcon
