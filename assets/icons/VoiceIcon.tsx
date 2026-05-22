import * as React from "react"
import Svg, { SvgProps, Path } from "react-native-svg"
const VoiceIcon = (props: SvgProps) => (
    <Svg
        xmlns="http://www.w3.org/2000/svg"
        width={16}
        height={16}
        fill="none"
        {...props}
    >
        <Path
            stroke="#9CACAF"
            strokeWidth={1.33}
            d="M4 7c0 2.5 2.068 4 4 4m0 0c1.932 0 4-1.5 4-4m-4 4v3.5M10 3.683v2.634a2 2 0 0 1-4 0V3.683a2 2 0 0 1 4 0Z"
        />
    </Svg>
)
export default VoiceIcon
