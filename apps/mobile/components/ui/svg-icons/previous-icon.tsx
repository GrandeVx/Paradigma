import * as React from "react";
import Svg, { Path } from "react-native-svg";
import { IconSvgProps, resolveColor } from "./base-icon";

export const PreviousIcon: React.FC<IconSvgProps> = ({
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
      <Path d="M14.0001 1.5396V1.5396C14.0001 8.27301 8.64856 13.7872 1.91817 13.9888L1.5396 14.0001L1.92276 14.0117C8.65127 14.2156 14.0001 19.729 14.0001 26.4606V26.4606" stroke="black" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round" />
    </Svg>
  );
};

PreviousIcon.displayName = "PreviousIcon";