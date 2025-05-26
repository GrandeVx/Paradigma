import * as React from "react";
import Svg, { Path } from "react-native-svg";
import { IconSvgProps, resolveColor } from "./base-icon";

export const MinimizeIcon: React.FC<IconSvgProps> = ({
  color = "currentColor",
  size = 24,
  ...props
}) => {
  const fillColor = resolveColor(color);

  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 36 4"
      fill="none"
      {...props}
    >
      <Path fill-rule="evenodd" clip-rule="evenodd" d="M0 2C0 1.46957 0.210714 0.96086 0.585786 0.585787C0.960859 0.210714 1.46957 0 2 0H34C34.5304 0 35.0391 0.210714 35.4142 0.585787C35.7893 0.96086 36 1.46957 36 2C36 2.53043 35.7893 3.03914 35.4142 3.41421C35.0391 3.78929 34.5304 4 34 4H2C1.46957 4 0.960859 3.78929 0.585786 3.41421C0.210714 3.03914 0 2.53043 0 2Z" fill={fillColor} />
    </Svg>
  );
};

MinimizeIcon.displayName = "MinimizeIcon";