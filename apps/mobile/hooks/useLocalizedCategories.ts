import { useTranslation } from 'react-i18next'
import { useMemo, useEffect } from 'react'
import type { MacroCategory, SubCategory } from '@prisma/client'
import {
  localizeMacroCategories,
  localizeSubCategories,
  localizeMacroCategoriesWithSubs,
  getLocalizedMacroCategoryName,
  getLocalizedSubCategoryName,
  getCategoriesWithVisualData,
  getSubCategoriesWithVisualData,
  type CategoryTranslations,
  type LocalizedMacroCategory,
  type LocalizedSubCategory
} from '@paradigma/shared'
import { TranslationCache } from '@/lib/translation-cache'

/**
 * Hook personalizzato per gestire le traduzioni delle categorie
 * Utilizza il sistema i18n di React per ottenere le traduzioni corrette
 */
export function useLocalizedCategories() {
  const { t, i18n } = useTranslation()
  const currentLanguage = i18n.language

  // Crea l'oggetto traduzioni dalla configurazione i18n con caching
  const translations: CategoryTranslations = useMemo(() => {
    // Try to get cached translations first
    const cachedTranslations = TranslationCache.getCachedTranslations(currentLanguage);
    
    if (cachedTranslations) {
      return cachedTranslations;
    }

    // If no cache hit, generate translations from i18n
    const freshTranslations: CategoryTranslations = {
      macro: {
      casa: t('categories.macro.casa'),
      cibo_bevande: t('categories.macro.cibo_bevande'),
      trasporti: t('categories.macro.trasporti'),
      salute_benessere: t('categories.macro.salute_benessere'),
      intrattenimento: t('categories.macro.intrattenimento'),
      tecnologia: t('categories.macro.tecnologia'),
      istruzione: t('categories.macro.istruzione'),
      finanze: t('categories.macro.finanze'),
      famiglia: t('categories.macro.famiglia'),
      sociale: t('categories.macro.sociale'),
      lavoro: t('categories.macro.lavoro'),
      investimenti: t('categories.macro.investimenti'),
      extra: t('categories.macro.extra')
    },
    sub: {
      // Casa
      casa_affitto: t('categories.sub.casa_affitto'),
      casa_arredamento: t('categories.sub.casa_arredamento'),
      casa_assicurazione: t('categories.sub.casa_assicurazione'),
      casa_elettrodomestici: t('categories.sub.casa_elettrodomestici'),
      casa_internet_telefono: t('categories.sub.casa_internet_telefono'),
      casa_spese_condominiali: t('categories.sub.casa_spese_condominiali'),
      casa_utenze: t('categories.sub.casa_utenze'),
      casa_riparazioni_manutenzione: t('categories.sub.casa_riparazioni_manutenzione'),
      casa_pulizie: t('categories.sub.casa_pulizie'),

      // Cibo & Bevande
      cibo_bar_caffe: t('categories.sub.cibo_bar_caffe'),
      cibo_delivery: t('categories.sub.cibo_delivery'),
      cibo_spesa: t('categories.sub.cibo_spesa'),
      cibo_ristoranti: t('categories.sub.cibo_ristoranti'),
      cibo_take_away: t('categories.sub.cibo_take_away'),
      cibo_bevande_alcoliche: t('categories.sub.cibo_bevande_alcoliche'),
      cibo_snack_bevande: t('categories.sub.cibo_snack_bevande'),
      cibo_dolci_pasticceria: t('categories.sub.cibo_dolci_pasticceria'),

      // Trasporti
      trasporti_assicurazione_auto: t('categories.sub.trasporti_assicurazione_auto'),
      trasporti_carburante: t('categories.sub.trasporti_carburante'),
      trasporti_manutenzione_auto: t('categories.sub.trasporti_manutenzione_auto'),
      trasporti_parcheggi: t('categories.sub.trasporti_parcheggi'),
      trasporti_pedaggi: t('categories.sub.trasporti_pedaggi'),
      trasporti_taxi: t('categories.sub.trasporti_taxi'),
      trasporti_pubblico: t('categories.sub.trasporti_pubblico'),
      trasporti_voli: t('categories.sub.trasporti_voli'),

      // Salute & Benessere
      salute_abbigliamento: t('categories.sub.salute_abbigliamento'),
      salute_bellezza: t('categories.sub.salute_bellezza'),
      salute_farmaci: t('categories.sub.salute_farmaci'),
      salute_giochi: t('categories.sub.salute_giochi'),
      salute_hotel: t('categories.sub.salute_hotel'),
      salute_regali: t('categories.sub.salute_regali'),
      salute_visite_mediche: t('categories.sub.salute_visite_mediche'),
      salute_dentista: t('categories.sub.salute_dentista'),

      // Intrattenimento
      intrattenimento_abbonamenti: t('categories.sub.intrattenimento_abbonamenti'),
      intrattenimento_cinema: t('categories.sub.intrattenimento_cinema'),
      intrattenimento_libri: t('categories.sub.intrattenimento_libri'),
      intrattenimento_eventi: t('categories.sub.intrattenimento_eventi'),
      intrattenimento_musica: t('categories.sub.intrattenimento_musica'),
      intrattenimento_videogiochi: t('categories.sub.intrattenimento_videogiochi'),
      intrattenimento_sport: t('categories.sub.intrattenimento_sport'),
      intrattenimento_hobby: t('categories.sub.intrattenimento_hobby'),
      intrattenimento_turismo: t('categories.sub.intrattenimento_turismo'),
      intrattenimento_concerti: t('categories.sub.intrattenimento_concerti'),
      intrattenimento_palestra: t('categories.sub.intrattenimento_palestra'),
      intrattenimento_discoteche: t('categories.sub.intrattenimento_discoteche'),

      // Tecnologia
      tecnologia_smartphone: t('categories.sub.tecnologia_smartphone'),
      tecnologia_computer: t('categories.sub.tecnologia_computer'),
      tecnologia_audio_video: t('categories.sub.tecnologia_audio_video'),
      tecnologia_elettronica: t('categories.sub.tecnologia_elettronica'),
      tecnologia_software_app: t('categories.sub.tecnologia_software_app'),
      tecnologia_servizi_online: t('categories.sub.tecnologia_servizi_online'),
      tecnologia_accessori: t('categories.sub.tecnologia_accessori'),

      // Istruzione
      istruzione_corsi_formazione: t('categories.sub.istruzione_corsi_formazione'),
      istruzione_corsi_online: t('categories.sub.istruzione_corsi_online'),
      istruzione_materiale_scolastico: t('categories.sub.istruzione_materiale_scolastico'),
      istruzione_ripetizioni: t('categories.sub.istruzione_ripetizioni'),
      istruzione_universita_scuola: t('categories.sub.istruzione_universita_scuola'),

      // Finanze
      finanze_costi_bancari: t('categories.sub.finanze_costi_bancari'),
      finanze_investimenti: t('categories.sub.finanze_investimenti'),
      finanze_prestiti: t('categories.sub.finanze_prestiti'),
      finanze_mutuo: t('categories.sub.finanze_mutuo'),
      finanze_consulenze: t('categories.sub.finanze_consulenze'),
      finanze_commissioni: t('categories.sub.finanze_commissioni'),
      finanze_assicurazioni: t('categories.sub.finanze_assicurazioni'),
      finanze_tasse: t('categories.sub.finanze_tasse'),

      // Famiglia
      famiglia_animali_domestici: t('categories.sub.famiglia_animali_domestici'),
      famiglia_anziani: t('categories.sub.famiglia_anziani'),
      famiglia_attivita_scolastiche: t('categories.sub.famiglia_attivita_scolastiche'),
      famiglia_bambini: t('categories.sub.famiglia_bambini'),
      famiglia_feste_compleanni: t('categories.sub.famiglia_feste_compleanni'),
      famiglia_neonati: t('categories.sub.famiglia_neonati'),

      // Sociale
      sociale_feste_cerimonie: t('categories.sub.sociale_feste_cerimonie'),
      sociale_beneficenza: t('categories.sub.sociale_beneficenza'),
      sociale_donazioni_religiose: t('categories.sub.sociale_donazioni_religiose'),
      sociale_contributi_sociali: t('categories.sub.sociale_contributi_sociali'),

      // Lavoro
      lavoro_stipendio: t('categories.sub.lavoro_stipendio'),
      lavoro_freelance: t('categories.sub.lavoro_freelance'),
      lavoro_bonus: t('categories.sub.lavoro_bonus'),
      lavoro_straordinari: t('categories.sub.lavoro_straordinari'),

      // Investimenti
      investimenti_dividendi: t('categories.sub.investimenti_dividendi'),
      investimenti_interessi: t('categories.sub.investimenti_interessi'),
      investimenti_crypto: t('categories.sub.investimenti_crypto'),

        // Extra
        extra_vendite: t('categories.sub.extra_vendite'),
        extra_regali: t('categories.sub.extra_regali'),
        extra_rimborsi: t('categories.sub.extra_rimborsi'),
        extra_altro: t('categories.sub.extra_altro')
      }
    };

    // Cache the fresh translations for future use
    TranslationCache.cacheTranslations(freshTranslations, currentLanguage);
    
    return freshTranslations;
  }, [t, currentLanguage])

  // Effect to preload translations when language changes
  useEffect(() => {
    TranslationCache.preloadCommonTranslations(currentLanguage);
  }, [currentLanguage]);

  // Funzioni helper che utilizzano le traduzioni
  const localizeCategory = (category: MacroCategory): LocalizedMacroCategory => ({
    ...category,
    localizedName: getLocalizedMacroCategoryName(category, translations)
  })

  const localizeSubCategory = (subCategory: SubCategory): LocalizedSubCategory => ({
    ...subCategory,
    localizedName: getLocalizedSubCategoryName(subCategory, translations)
  })

  const localizeCategories = (categories: MacroCategory[]): LocalizedMacroCategory[] => {
    return localizeMacroCategories(categories, translations)
  }

  const localizeSubCategories = (subCategories: SubCategory[]): LocalizedSubCategory[] => {
    return localizeSubCategories(subCategories, translations)
  }

  const localizeCategoriesWithSubs = (
    categories: (MacroCategory & { subCategories: SubCategory[] })[]
  ): LocalizedMacroCategory[] => {
    return localizeMacroCategoriesWithSubs(categories, translations)
  }

  const getCategoriesWithVisuals = (categories: MacroCategory[]) => {
    return getCategoriesWithVisualData(categories, translations)
  }

  const getSubCategoriesWithVisuals = (subCategories: SubCategory[]) => {
    return getSubCategoriesWithVisualData(subCategories, translations)
  }

  return {
    translations,
    localizeCategory,
    localizeSubCategory,
    localizeCategories,
    localizeSubCategories,
    localizeCategoriesWithSubs,
    getCategoriesWithVisuals,
    getSubCategoriesWithVisuals
  }
}

/**
 * Hook per ottenere una singola categoria tradotta
 */
export function useLocalizedCategory(category: MacroCategory | undefined) {
  const { localizeCategory } = useLocalizedCategories()

  return useMemo(() => {
    if (!category) return undefined
    return localizeCategory(category)
  }, [category, localizeCategory])
}

/**
 * Hook per ottenere una singola sotto categoria tradotta
 */
export function useLocalizedSubCategory(subCategory: SubCategory | undefined) {
  const { localizeSubCategory } = useLocalizedCategories()

  return useMemo(() => {
    if (!subCategory) return undefined
    return localizeSubCategory(subCategory)
  }, [subCategory, localizeSubCategory])
}