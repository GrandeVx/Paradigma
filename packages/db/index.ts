import pino from 'pino';
import { PrismaClient , Prisma } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import SuperJSON from 'superjson'; // Corretto import

import {
  CacheCase,
  PrismaExtensionRedis,
  type AutoCacheConfig,
  type CacheConfig,
} from 'prisma-extension-redis';


const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Istanza PrismaClient di base
export const prismaBase = // Rinominato per chiarezza, useremo 'db' per l'istanza estesa
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

// Configurazione client Redis
const redisClientConfig = { // Rinominato per chiarezza
  host: process.env.REDIS_HOST || "127.0.0.1", // Usa variabili d'ambiente
  username: process.env.REDIS_USERNAME || "default",
  password: process.env.REDIS_PASSWORD || undefined, // Gestisci assenza di password
  db: parseInt(process.env.REDIS_DB || "0", 10),
  port: parseInt(process.env.REDIS_PORT || "6379", 10),
};

const logger = pino({
  level: process.env.NODE_ENV === "development" ? "debug" : "info",
});


// Configurazione Auto-Caching
const autoCacheConfig: AutoCacheConfig = {
  excludedModels: ['Session', 'Account', 'Verification'], // Escludiamo i modelli di BetterAuth dal caching automatico di questa estensione
  excludedOperations: [], // Nessuna operazione esclusa globalmente per ora
  models: [
    {
      model: 'User',
      ttl: 3600, // 1 ora: i dati utente non cambiano spessissimo
      stale: 600, // 10 minuti
      excludedOperations: ['count'], // Il count degli utenti totali non è rilevante per la cache per-utente
    },
    {
      model: 'MoneyAccount',
      ttl: 600, // 10 minuti per la lista dei conti di un utente
      stale: 60,  // 1 minuto
      // NOTA IMPORTANTE: La cache del SALDO di MoneyAccount (che deriva da Transaction.aggregate)
      // verrà cachata con il TTL di default di 'autoCacheConfig.ttl' o 'cacheMainConfig.ttl'.
      // L'INVALIDAZIONE di questa cache del saldo dovrà essere gestita MANUALMENTE
      // nel codice delle tue procedure tRPC quando una Transaction viene creata/modificata/eliminata,
      // poiché questa estensione potrebbe non avere un meccanismo 'invalidateRelated' robusto.
    },
    {
      model: 'Transaction',
      ttl: 0, // TTL 0 significa che le query dirette su Transaction (es. findMany) NON verranno cachate di default.
               // Questo è generalmente buono perché le liste di transazioni sono molto dinamiche.
               // Le query 'aggregate' su Transaction (per il saldo) SARANNO cachate se non escluse qui
               // e useranno il TTL di default (vedi sotto).
      // Le MUTAZIONI su Transaction (create, update, delete) sono i trigger per invalidare MANUALMENTE
      // la cache del saldo del MoneyAccount associato.
    },
    {
      model: 'Goal',
      ttl: 1800, // 30 minuti per la lista e i dettagli degli obiettivi
      stale: 300, // 5 minuti
    },
    {
      model: 'Budget', // Le impostazioni di budget (fisse per utente/macro)
      ttl: 3600, // 1 ora, non cambiano molto frequentemente
      stale: 600, // 10 minuti
    },
    {
      model: 'RecurringTransactionRule',
      ttl: 1800, // 30 minuti
      stale: 300, // 5 minuti
    },
    {
      model: 'MacroCategory', // Cambiano raramente (solo da seed/admin)
      ttl: 86400, // 1 giorno
      stale: 3600, // 1 ora
    },
    {
      model: 'SubCategory', // Cambiano raramente
      ttl: 86400, // 1 giorno
      stale: 3600, // 1 ora
    },
  ],
  ttl: 300, // Default TTL (5 minuti) per le query dei modelli non specificati sopra
            // e per le operazioni (come 'aggregate') non escluse nei modelli specificati.
};

// Configurazione Cache Principale
const cacheMainConfig: CacheConfig = {
  ttl: 600, // Default Time-to-live (10 minuti) se non specificato in 'autoCacheConfig'
  stale: 60, // Default Stale time (1 minuto)
  auto: autoCacheConfig,
  logger,
  onError: (err) => {
    logger.error({ redisError: err, previousErrors: err.previousErrors }, "Errore Cache Redis");
  },  
  onHit: (hit) => {
    logger.debug(hit, "Cache Redis HIT");
  },
  onMiss: (miss) => {
    logger.debug(miss, "Cache Redis MISS");
  },
  transformer: {
    deserialize: data => SuperJSON.parse(data as string), // Assicurati che data sia stringa
    serialize: data => SuperJSON.stringify(data),
  },
  type: "STRING",
  cacheKey: {
    case: CacheCase.SNAKE_CASE,
    delimiter: ':',
    prefix: 'balanceapp', // Prefisso specifico per la tua applicazione
  },
};

// Istanza PrismaClient estesa con il caching Redis
export const db = prismaBase.$extends(
  PrismaExtensionRedis({ config: cacheMainConfig, client: redisClientConfig })
);

// Esporta tutti gli schemi Zod generati
export * from "./prisma/zod";
export { Decimal, Prisma };

// Gestione dell'istanza Prisma in sviluppo per evitare multiple istanze con HMR
// @ts-expect-error - PrismaClient con estensione Redis potrebbe non essere perfettamente tipizzato per globalThis
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
