import * as React from "react"
import Svg, { SvgProps, Path } from "react-native-svg"
const UserIconActive = (props: SvgProps) => (
    <Svg
        width={21}
        height={20}
        fill="none"
        {...props}
    >
        <Path
            stroke="#fff"
            strokeWidth={0.75}
            d="M10.5 10.375a2.252 2.252 0 0 0 2.25-2.25 2.25 2.25 0 1 0-2.25 2.25ZM8.972 5.84a2.75 2.75 0 1 1 3.056 4.573 2.75 2.75 0 0 1-3.056-4.573Z"
        />
        <Path
            stroke="#fff"
            strokeWidth={0.75}
            d="M6.375 16.486v.215l.186.109a7.812 7.812 0 0 0 7.878 0l.186-.109V15.625a2.252 2.252 0 0 0-2.25-2.25h-3.75a2.252 2.252 0 0 0-2.25 2.25v.86Zm8.746-.901.012.82.612-.546a7.875 7.875 0 1 0-10.49 0l.612.546.013-.82a2.751 2.751 0 0 1 2.745-2.71h3.75a2.752 2.752 0 0 1 2.746 2.71ZM5.847 3.037A8.375 8.375 0 0 1 10.5 1.625a8.385 8.385 0 0 1 8.375 8.376A8.376 8.376 0 1 1 5.847 3.037Z"
        />
    </Svg>
)
export default UserIconActive
