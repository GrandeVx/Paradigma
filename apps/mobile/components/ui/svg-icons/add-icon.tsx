import * as React from "react";
import Svg, { Path } from "react-native-svg";
import { IconSvgProps, resolveColor } from "./base-icon";

export const AddIcon: React.FC<IconSvgProps> = ({
  color = "currentColor",
  size = 24,
  ...props
}) => {
  const fillColor = resolveColor(color);

  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 36 36"
      fill="none"
      {...props}
    >
      <Path d="M16 34C16 34.5304 16.2107 35.0391 16.5858 35.4142C16.9609 35.7893 17.4696 36 18 36C18.5304 36 19.0391 35.7893 19.4142 35.4142C19.7893 35.0391 20 34.5304 20 34V20H34C34.5304 20 35.0391 19.7893 35.4142 19.4142C35.7893 19.0391 36 18.5304 36 18C36 17.4696 35.7893 16.9609 35.4142 16.5858C35.0391 16.2107 34.5304 16 34 16H20V2C20 1.46957 19.7893 0.960859 19.4142 0.585786C19.0391 0.210714 18.5304 0 18 0C17.4696 0 16.9609 0.210714 16.5858 0.585786C16.2107 0.960859 16 1.46957 16 2V16H2C1.46957 16 0.960859 16.2107 0.585786 16.5858C0.210714 16.9609 0 17.4696 0 18C0 18.5304 0.210714 19.0391 0.585786 19.4142C0.960859 19.7893 1.46957 20 2 20H16V34Z" fill={fillColor} />
    </Svg>
  );
};

AddIcon.displayName = "AddIcon";