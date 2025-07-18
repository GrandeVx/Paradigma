import { MacroCategory, SubCategory } from '@prisma/client'
import type { CategoryType } from '@prisma/client'

// Tipi per le categorie internazionalizzate
export interface LocalizedMacroCategory extends MacroCategory {
  localizedName: string
  subCategories?: LocalizedSubCategory[]
}

export interface LocalizedSubCategory extends SubCategory {
  localizedName: string
  macroCategory?: LocalizedMacroCategory
}

// Interfaccia per le traduzioni
export interface CategoryTranslations {
  macro: Record<string, string>
  sub: Record<string, string>
}

// Funzione per ottenere il nome localizzato di una macro categoria
export function getLocalizedMacroCategoryName(
  category: MacroCategory,
  translations: CategoryTranslations
): string {
  // Minimal debug logging
  console.log(`🔍 Category: ${category.name}, Key: ${category.key || 'undefined'}`);
  
  // Prova prima con la chiave
  if (category.key && translations.macro[category.key]) {
    console.log(`✅ Found translation: ${translations.macro[category.key]}`);
    return translations.macro[category.key]
  }
  
  // Fallback al nome esistente per compatibilità
  console.log(`⚠️ Using fallback: ${category.name}`);
  return category.name
}

// Funzione per ottenere il nome localizzato di una sotto categoria
export function getLocalizedSubCategoryName(
  subCategory: SubCategory,
  translations: CategoryTranslations
): string {
  // Prova prima con la chiave
  if (subCategory.key && translations.sub[subCategory.key]) {
    return translations.sub[subCategory.key]
  }
  
  // Fallback al nome esistente per compatibilità
  return subCategory.name
}

// Funzione per localizzare una lista di macro categorie
export function localizeMacroCategories(
  categories: MacroCategory[],
  translations: CategoryTranslations
): LocalizedMacroCategory[] {
  return categories.map(category => ({
    ...category,
    localizedName: getLocalizedMacroCategoryName(category, translations)
  }))
}

// Funzione per localizzare una lista di sotto categorie
export function localizeSubCategories(
  subCategories: SubCategory[],
  translations: CategoryTranslations
): LocalizedSubCategory[] {
  return subCategories.map(subCategory => ({
    ...subCategory,
    localizedName: getLocalizedSubCategoryName(subCategory, translations)
  }))
}

// Funzione per localizzare macro categorie con le loro sotto categorie
export function localizeMacroCategoriesWithSubs(
  categories: (MacroCategory & { subCategories: SubCategory[] })[],
  translations: CategoryTranslations
): LocalizedMacroCategory[] {
  return categories.map(category => ({
    ...category,
    localizedName: getLocalizedMacroCategoryName(category, translations),
    subCategories: localizeSubCategories(category.subCategories, translations)
  }))
}

// Funzione per trovare una categoria per chiave
export function findCategoryByKey(
  categories: MacroCategory[],
  key: string
): MacroCategory | undefined {
  return categories.find(cat => cat.key === key)
}

// Funzione per trovare una sotto categoria per chiave
export function findSubCategoryByKey(
  subCategories: SubCategory[],
  key: string
): SubCategory | undefined {
  return subCategories.find(subCat => subCat.key === key)
}

// Funzione per ottenere tutte le categorie di un certo tipo
export function getCategoriesByType(
  categories: MacroCategory[],
  type: CategoryType
): MacroCategory[] {
  return categories.filter(cat => cat.type === type)
}

// Funzione per creare una mappa chiave -> categoria per lookup veloci
export function createCategoryKeyMap(
  categories: MacroCategory[]
): Map<string, MacroCategory> {
  const map = new Map<string, MacroCategory>()
  
  categories.forEach(category => {
    if (category.key) {
      map.set(category.key, category)
    }
  })
  
  return map
}

// Funzione per creare una mappa chiave -> sotto categoria per lookup veloci
export function createSubCategoryKeyMap(
  subCategories: SubCategory[]
): Map<string, SubCategory> {
  const map = new Map<string, SubCategory>()
  
  subCategories.forEach(subCategory => {
    if (subCategory.key) {
      map.set(subCategory.key, subCategory)
    }
  })
  
  return map
}

// Funzione per validare che una chiave categoria esista
export function isValidCategoryKey(
  key: string,
  categories: MacroCategory[]
): boolean {
  return categories.some(cat => cat.key === key)
}

// Funzione per validare che una chiave sotto categoria esista
export function isValidSubCategoryKey(
  key: string,
  subCategories: SubCategory[]
): boolean {
  return subCategories.some(subCat => subCat.key === key)
}

// Funzione per ottenere le categorie con i loro colori e icone
export function getCategoriesWithVisualData(
  categories: MacroCategory[],
  translations: CategoryTranslations
): Array<{
  key: string
  localizedName: string
  color: string
  icon: string
  type: CategoryType
}> {
  return categories.map(category => ({
    key: category.key || category.id,
    localizedName: getLocalizedMacroCategoryName(category, translations),
    color: category.color,
    icon: category.icon,
    type: category.type
  }))
}

// Funzione per ottenere le sotto categorie con le loro icone
export function getSubCategoriesWithVisualData(
  subCategories: SubCategory[],
  translations: CategoryTranslations
): Array<{
  key: string
  localizedName: string
  icon: string
  macroCategoryId: string
}> {
  return subCategories.map(subCategory => ({
    key: subCategory.key || subCategory.id,
    localizedName: getLocalizedSubCategoryName(subCategory, translations),
    icon: subCategory.icon,
    macroCategoryId: subCategory.macroCategoryId
  }))
}

// Funzione helper per migrare gradualmente dall'uso di nomi alle chiavi
export function getCategoryIdentifier(category: MacroCategory): string {
  // Preferisce la chiave se disponibile, altrimenti usa l'ID
  return category.key || category.id
}

// Funzione helper per migrare gradualmente dall'uso di nomi alle chiavi per sotto categorie
export function getSubCategoryIdentifier(subCategory: SubCategory): string {
  // Preferisce la chiave se disponibile, altrimenti usa l'ID
  return subCategory.key || subCategory.id
}

// Costanti per le chiavi delle categorie più comuni
export const COMMON_CATEGORY_KEYS = {
  // Expense categories
  CASA: 'casa',
  CIBO_BEVANDE: 'cibo_bevande',
  TRASPORTI: 'trasporti',
  SALUTE_BENESSERE: 'salute_benessere',
  INTRATTENIMENTO: 'intrattenimento',
  TECNOLOGIA: 'tecnologia',
  ISTRUZIONE: 'istruzione',
  FINANZE: 'finanze',
  FAMIGLIA: 'famiglia',
  SOCIALE: 'sociale',
  
  // Income categories
  LAVORO: 'lavoro',
  INVESTIMENTI: 'investimenti',
  EXTRA: 'extra'
} as const

// Costanti per le chiavi delle sotto categorie più comuni
export const COMMON_SUBCATEGORY_KEYS = {
  // Casa
  CASA_AFFITTO: 'casa_affitto',
  CASA_UTENZE: 'casa_utenze',
  
  // Cibo
  CIBO_SPESA: 'cibo_spesa',
  CIBO_RISTORANTI: 'cibo_ristoranti',
  
  // Trasporti
  TRASPORTI_CARBURANTE: 'trasporti_carburante',
  TRASPORTI_PUBBLICO: 'trasporti_pubblico',
  
  // Lavoro
  LAVORO_STIPENDIO: 'lavoro_stipendio',
  LAVORO_FREELANCE: 'lavoro_freelance',
  
  // Extra
  EXTRA_ALTRO: 'extra_altro'
} as const

// Tipo per le chiavi delle categorie
export type CategoryKey = typeof COMMON_CATEGORY_KEYS[keyof typeof COMMON_CATEGORY_KEYS]
export type SubCategoryKey = typeof COMMON_SUBCATEGORY_KEYS[keyof typeof COMMON_SUBCATEGORY_KEYS]