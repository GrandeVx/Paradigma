import pino from 'pino';
import { PrismaClient, Prisma } from '@prisma/client';
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

// Configurazione client Redis - solo se Redis è configurato
const isRedisConfigured = process.env.REDIS_HOST && process.env.REDIS_HOST.trim() !== "";

const redisClientConfig = isRedisConfigured ? {
  host: process.env.REDIS_HOST,
  username: process.env.REDIS_USERNAME || "default",
  password: process.env.REDIS_PASSWORD || undefined,
  db: parseInt(process.env.REDIS_DB || "0", 10),
  port: parseInt(process.env.REDIS_PORT || "6379", 10),
} : null;



const logger = pino({
  level: process.env.NODE_ENV === "development" ? "debug" : "info",
});


// Configurazione Auto-Caching
const autoCacheConfig: AutoCacheConfig = {
  /** 
   * Here you can exclude models from the cache
  */
  excludedModels: [
    'Session', 'Account', 'Verification', 'Comment' // Better Auth - esclusi per sicurezza
  ],
  excludedOperations: [], // Nessuna operazione esclusa globalmente per ora
  models: [
    {
      model: 'User',
      ttl: 3600, // 1 ora: i dati utente non cambiano spessissimo
      stale: 600, // 10 minuti
      excludedOperations: ['count'], // Il count degli utenti totali non è rilevante per la cache per-utente
    },
    {
      model: 'Post',
      ttl: 900, // 15 minuti: i post sono relativamente statici una volta pubblicati
      stale: 180, // 3 minuti
      excludedOperations: ['count'], // Real-time counting more important than caching
    },
    {
      model: 'Group',
      ttl: 1800, // 30 minuti: i gruppi cambiano raramente
      stale: 300, // 5 minuti
    },
    {
      model: 'GroupMember',
      ttl: 600, // 10 minuti: le membership cambiano più frequentemente
      stale: 120, // 2 minuti
    },
    {
      model: 'Like',
      ttl: 60, // 1 minuto: i like sono real-time
      stale: 10, // 10 secondi
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
    prefix: 'paradigma', // Prefisso specifico per la tua applicazione
  },
};

// Istanza PrismaClient estesa con il caching Redis (solo se configurato)
export const db =
  prismaBase.$extends(
    PrismaExtensionRedis({ config: cacheMainConfig, client: redisClientConfig! })
  )


// Esporta tutti gli schemi Zod generati
export * from "./prisma/zod";
export { Decimal, Prisma, db as PrismaClient };

// Gestione dell'istanza Prisma in sviluppo per evitare multiple istanze con HMR
// @ts-expect-error - PrismaClient con estensione Redis potrebbe non essere perfettamente tipizzato per globalThis
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
