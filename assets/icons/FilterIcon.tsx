import * as React from "react"
import Svg, { SvgProps, Rect, Path } from "react-native-svg"
const FilterIcon = (props: SvgProps) => (
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
            d="M15.625 11.321h-9.75m6.5 3.572h-6.5m3.25 3.571h-3.25m13-10.714h-13m13.813 3.571v8.929m0 0 2.437-2.679m-2.438 2.679-2.437-2.679"
        />
    </Svg>
)
export default FilterIcon
