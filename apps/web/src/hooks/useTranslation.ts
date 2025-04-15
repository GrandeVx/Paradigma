"use client";

import { useParams } from "next/navigation";
import { en } from "@/translations/en";
import { it } from "@/translations/it";
import type { TranslationType } from "@/translations/en";

const translations: Record<string, TranslationType> = { en, it };

export function useTranslation() {
  const params = useParams();
  // Ensure we always have a valid locale
  const locale =
    typeof params?.locale === "string" &&
    (params.locale === "en" || params.locale === "it")
      ? params.locale
      : "en";

  // Always return the English translations as fallback if something goes wrong
  const t = translations[locale] || translations.en;

  return {
    t,
    locale,
  } as const; // This ensures TypeScript knows t will never be undefined
}
