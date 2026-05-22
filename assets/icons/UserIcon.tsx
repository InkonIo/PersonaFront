import * as React from "react"
import Svg, { SvgProps, Path } from "react-native-svg"
const UserIcon = (props: SvgProps) => (
    <Svg
        width={21}
        height={20}
        fill="none"
        {...props}
    >
        <Path
            fill="#9CACAF"
            stroke="#9CACAF"
            strokeWidth={0.75}
            d="M10.5 10.375a2.252 2.252 0 0 0 2.25-2.25 2.25 2.25 0 1 0-2.25 2.25ZM8.972 5.838a2.75 2.75 0 1 1 3.056 4.573 2.75 2.75 0 0 1-3.056-4.573Z"
        />
        <Path
            fill="#9CACAF"
            stroke="#9CACAF"
            strokeWidth={0.75}
            d="M6.375 16.486v.215l.186.108a7.812 7.812 0 0 0 7.878 0l.186-.108v-1.076a2.252 2.252 0 0 0-2.25-2.25h-3.75a2.252 2.252 0 0 0-2.25 2.25v.86Zm8.746-.902.012.821.612-.547a7.875 7.875 0 1 0-10.49 0l.612.547.013-.82a2.751 2.751 0 0 1 2.745-2.71h3.75a2.751 2.751 0 0 1 2.746 2.71ZM5.847 3.036A8.375 8.375 0 0 1 10.5 1.625 8.385 8.385 0 0 1 18.875 10 8.376 8.376 0 1 1 5.847 3.036Z"
        />
    </Svg>
)
export default UserIcon
