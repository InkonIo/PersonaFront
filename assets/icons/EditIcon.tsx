import * as React from "react"
import Svg, {SvgProps, G, Rect, Path, Defs, ClipPath} from "react-native-svg"
const EditIcon = (props: SvgProps) => (
    <Svg
        width={25}
        height={24}
        fill="none"
        {...props}
    >
        <Rect width={24} height={24} x={0.25} fill="#F3F4F6" rx={12} />
        <G
            stroke="#1F2937"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.333}
            clipPath="url(#a)"
        >
            <Path d="M11.583 6.667H6.917A1.333 1.333 0 0 0 5.583 8v9.333a1.333 1.333 0 0 0 1.334 1.334h9.333a1.333 1.333 0 0 0 1.333-1.334v-4.666" />
            <Path d="M16.583 5.667a1.414 1.414 0 1 1 2 2L12.25 14l-2.667.667L10.25 12l6.333-6.333Z" />
        </G>
        <Defs>
            <ClipPath id="a">
                <Path fill="#fff" d="M4.25 4h16v16h-16z" />
            </ClipPath>
        </Defs>
    </Svg>
)
export default EditIcon
