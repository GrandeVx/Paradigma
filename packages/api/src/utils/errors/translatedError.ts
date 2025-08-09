import { TRPCError } from "@trpc/server";
import { getTranslation } from "../languages";
import type { Context } from "../../trpc";

type TRPCErrorCode =
  | 'BAD_REQUEST'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'TIMEOUT'
  | 'CONFLICT'
  | 'PRECONDITION_FAILED'
  | 'PAYLOAD_TOO_LARGE'
  | 'METHOD_NOT_SUPPORTED'
  | 'UNPROCESSABLE_CONTENT'
  | 'TOO_MANY_REQUESTS'
  | 'CLIENT_CLOSED_REQUEST'
  | 'INTERNAL_SERVER_ERROR';

/**
 * Genera un errore TRPC con messaggio localizzato in base alla lingua dell'utente
 * 
 * @param ctx Contesto della richiesta TRPC con informazioni sull'utente
 * @param code Codice di errore TRPC
 * @param translationPath Percorso all'interno dell'oggetto traduzioni
 * @param cause Cause opzionale dell'errore
 * @returns TRPCError con messaggio tradotto
 */
export function translatedError(
  ctx: Context,
  code: TRPCErrorCode,
  translationPath: string[],
  cause?: unknown
): TRPCError {
  // Ottiene la lingua preferita dell'utente dall'oggetto sessione
  const language = (ctx.session?.user as any)?.language;
  
  // Ottiene il messaggio tradotto
  const message = getTranslation(language, translationPath);
  
  return new TRPCError({
    code,
    message,
    cause,
  });
}

/**
 * Helper per restituire un errore "notFound" comune per risorse non trovate
 * 
 * @param ctx Contesto della richiesta TRPC
 * @param resourceType Tipo di risorsa (account, transaction, goal, ecc.)
 * @returns TRPCError con messaggio tradotto
 */
export function notFoundError(ctx: Context, resourceType: 'account' | 'transaction' | 'goal' | 'category' | 'recurringRule' | 'group' | 'post' | 'comment' | 'member' | 'request' | 'user'): TRPCError {
  return translatedError(ctx, 'NOT_FOUND', [resourceType, 'errors', 'notFound']);
}

/**
 * Helper per restituire un errore "nonAutenticato"
 */
export function notAuthenticatedError(ctx: Context): TRPCError {
  return translatedError(ctx, 'UNAUTHORIZED', ['common', 'errors', 'notAuthenticated']);
}

/**
 * Helper per restituire un errore "non autorizzato"
 */
export function notAuthorizedError(ctx: Context): TRPCError {
  return translatedError(ctx, 'FORBIDDEN', ['common', 'errors', 'notAuthorized']);
}

/**
 * Helper per restituire un errore "errore del server"
 */
export function serverError(ctx: Context, cause?: unknown): TRPCError {
  return translatedError(ctx, 'INTERNAL_SERVER_ERROR', ['common', 'errors', 'serverError'], cause);
}

/**
 * Helper per restituire un errore "richiesta non valida"
 */
export function badRequestError(ctx: Context, cause?: unknown): TRPCError {
  return translatedError(ctx, 'BAD_REQUEST', ['common', 'errors', 'badRequest'], cause);
} 