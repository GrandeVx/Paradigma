import { en } from './en';
import type { TranslationType } from './en';
import { it } from './it';

// Map delle lingue disponibili
export const translations: Record<string, TranslationType> = {
  'en': en,
  'it': it,
  'en-US': en, // Fallback per varianti comuni
  'it-IT': it,
};

// Funzione per ottenere una traduzione in base alla lingua e al percorso
export function getTranslation(
  language: string | undefined,
  path: string[] // es: ['account', 'mutation', 'create', 'errors', 'sameNameUsed']
): string {
  // Default a inglese se la lingua non è specificata o non supportata
  const lang = language && translations[language] ? language : 'en';
  
  let result: unknown = translations[lang];
  
  // Percorre l'oggetto seguendo il percorso
  for (const key of path) {
    if (result && typeof result === 'object' && key in (result as Record<string, unknown>)) {
      result = (result as Record<string, unknown>)[key];
    } else {
      // Se il percorso non esiste, fallback all'inglese
      if (lang !== 'en') {
        return getTranslation('en', path);
      }
      return `Translation missing: ${path.join('.')}`;
    }
  }
  
  return typeof result === 'string' ? result : `Invalid translation: ${path.join('.')}`;
}

// Tipo di utility per percorsi tipizzati
export type { TranslationType };
export { en };
