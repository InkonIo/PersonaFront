import * as React from "react"
import Svg, { SvgProps, Path } from "react-native-svg"
const ImageIcon = (props: SvgProps) => (
    <Svg
        width={17}
        height={16}
        fill="none"
        {...props}
    >
        <Path
            stroke="#17412D"
            strokeWidth={1.33}
            d="m2.5 9.704 2.365-4.147a1.063 1.063 0 0 1 1.855-.025l1.981 3.275a.998.998 0 0 0 1.743-.024.997.997 0 0 1 1.697-.092L14.5 12m-9.818 2h8.182s1.636 0 1.636-2.182V4.182A2.182 2.182 0 0 0 12.318 2H4.682A2.182 2.182 0 0 0 2.5 4.182v7.636C2.5 13.023 3.477 14 4.682 14Z"
        />
    </Svg>
)
export default ImageIcon
