import * as React from "react";
import Svg, { ClipPath, Defs, G, Path } from "react-native-svg";
import { IconSvgProps, resolveColor } from "./base-icon";

export const WalletIcon: React.FC<IconSvgProps> = ({
  color = "currentColor",
  size = 24,
  ...props
}) => {
  const fillColor = resolveColor(color);

  return (
    <Svg width={size} height={size} fill="none" viewBox="0 0 21 20" {...props}>
      <G clipPath="url(#a)">
        <Path fill={fillColor} d="M14.292 10.834a1.25 1.25 0 1 1-2.5 0 1.25 1.25 0 0 1 2.5 0Z" />
        <Path fill={fillColor} fillRule="evenodd" d="m4.136 4.773 9.166-2.62a2.083 2.083 0 0 1 2.656 2.004V5a1.666 1.666 0 0 1 1.667 1.666V15a1.667 1.667 0 0 1-1.667 1.666H4.292A1.667 1.667 0 0 1 2.625 15V6.666c0-.87.696-1.66 1.51-1.893Zm9.625-1.017a.417.417 0 0 1 .53.4V5H9.409l4.353-1.244Zm-9.47 2.91h11.667V15H4.292V6.666Z" clipRule="evenodd" />
      </G>
      <Defs>
        <ClipPath id="a">
          <Path fill="#fff" d="M.125 0h20v20h-20z" />
        </ClipPath>
      </Defs>
    </Svg>

  );
};

WalletIcon.displayName = "WalletIcon";