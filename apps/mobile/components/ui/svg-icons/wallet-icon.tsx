import * as React from "react";
import Svg, { Path } from "react-native-svg";
import { IconSvgProps, resolveColor } from "./base-icon";

export const WalletIcon: React.FC<IconSvgProps> = ({
  color = "currentColor",
  size = 24,
  ...props
}) => {
  const fillColor = resolveColor(color);

  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 6 6"
      fill="none"
      {...props}
    >
      <Path d="M6 3C6 3.79565 5.68393 4.55871 5.12132 5.12132C4.55871 5.68393 3.79565 6 3 6C2.20435 6 1.44129 5.68393 0.878679 5.12132C0.31607 4.55871 0 3.79565 0 3C0 2.20435 0.31607 1.44129 0.878679 0.878679C1.44129 0.31607 2.20435 0 3 0C3.79565 0 4.55871 0.31607 5.12132 0.878679C5.68393 1.44129 6 2.20435 6 3Z" fill={fillColor} />
    </Svg>
  );
};

WalletIcon.displayName = "WalletIcon";