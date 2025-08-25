import * as React from "react";
import Svg, { Path } from "react-native-svg";
import { IconSvgProps, resolveColor } from "./base-icon";

export const ActivityIcon: React.FC<IconSvgProps> = ({
  size = 24,
  color,
  ...props
}) => {
  const resolvedColor = resolveColor(color);

  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      {...props}
    >
      <Path
        d="M22 12H18L15 21L9 3L6 12H2"
        stroke={resolvedColor}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};