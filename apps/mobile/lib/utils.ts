import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { useTranslation } from "react-i18next";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Get the title of the current route.
 * @param route
 * @returns
 */
export function getTitle(route: { name: string }) {
  const { t } = useTranslation();
  return t(`header.${route.name}`);
}

/**
 *  Check if the user can go back from the current route.
 * @param route
 * @returns
 */
export function canGoBack(route: string): boolean {
  console.log(route);
  if (route == "home" || route == "home") {
    return false;
  }

  return true;
}
