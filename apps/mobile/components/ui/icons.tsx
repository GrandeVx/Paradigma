import * as React from "react";
import { Icon, IconProps } from "./icon";

// Base components for all icons with default props
const createIconComponent = (name: string) => {
  const IconComponent = React.forwardRef<React.ElementRef<typeof Icon>, Omit<IconProps, "name">>(
    (props, ref) => <Icon ref={ref} name={name} {...props} />
  );

  IconComponent.displayName = `${name.charAt(0).toUpperCase() + name.slice(1).replace(/-./g, x => x[1].toUpperCase())}Icon`;

  return IconComponent;
};

// Icon Components
export const CloseIcon = createIconComponent("close");
export const NextIcon = createIconComponent("next");
export const PreviousIcon = createIconComponent("previous");
export const DeleteBackIcon = createIconComponent("delete-back");
export const RefreshIcon = createIconComponent("refresh");
export const UpIcon = createIconComponent("up");
export const DownIcon = createIconComponent("down");
export const LeftIcon = createIconComponent("left");
export const RightIcon = createIconComponent("right");
export const AIIcon = createIconComponent("ai");
export const BankCardIcon = createIconComponent("bank-card");
export const BankIcon = createIconComponent("bank");
export const CalendarIcon = createIconComponent("calendar");
export const CashIcon = createIconComponent("cash");
export const LinkIcon = createIconComponent("link");
export const PigMoneyIcon = createIconComponent("pig-money");
export const ScheduleIcon = createIconComponent("schedule");
export const WalletIcon = createIconComponent("wallet");
export const BoxIcon = createIconComponent("box");
export const AddIcon = createIconComponent("add");
export const MinimizeIcon = createIconComponent("minimize");
export const DocumentIcon = createIconComponent("document");
export const TargetIcon = createIconComponent("target");
export const ChartVerticalIcon = createIconComponent("chart-vertical");
export const EditIcon = createIconComponent("edit");
export const EyeCloseIcon = createIconComponent("eye-close");
export const EyeIcon = createIconComponent("eye");
export const DeleteIcon = createIconComponent("delete");
export const ChecksIcon = createIconComponent("checks");
export const AtIcon = createIconComponent("at");



export const AccountIcons = {
  "1": "cash",
  "2": "pig-money",
  "3": "target",
  "4": "bank-card",
  "5": "bank",

}

export const AccountColors = {
  "1": "#FDAD0C",
  "2": "#E81411",
  "3": "#03965E",
  "4": "#409FF8",
  "5": "#7E01FB",
  "6": "#FA6B97",
}


/*

  "3": "box",
  "4": "calendar",
  "5": "checks",
  */


// Export the list of all available icons for documentation or UI purposes
export const iconNames = [
  "close",
  "next",
  "previous",
  "delete-back",
  "refresh",
  "up",
  "down",
  "left",
  "right",
  "ai",
  "bank-card",
  "bank",
  "calendar",
  "cash",
  "link",
  "pig-money",
  "schedule",
  "wallet",
  "box",
  "add",
  "minimize",
  "document",
  "target",
  "chart-vertical",
  "edit",
  "eye-close",
  "eye",
  "delete",
  "checks",
  "at",
] as const;

export type IconName = typeof iconNames[number]; 