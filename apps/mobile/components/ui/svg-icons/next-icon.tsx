import * as React from "react";
import Svg, { Path } from "react-native-svg";
import { IconSvgProps, resolveColor } from "./base-icon";

export const NextIcon: React.FC<IconSvgProps> = ({
  color = "currentColor",
  size = 24,
  ...props
}) => {
  const fillColor = resolveColor(color);

  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 16 28"
      fill="none"
      {...props}
    >
      <Path d="M1.53974 26.4604V26.4604C1.53974 19.727 6.8913 14.2128 13.6217 14.0112L14.0003 13.9999L13.6171 13.9883C6.88858 13.7844 1.53974 8.27098 1.53974 1.53938V1.53938" stroke="black" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round" />
    </Svg>
  );
};

NextIcon.displayName = "NextIcon";