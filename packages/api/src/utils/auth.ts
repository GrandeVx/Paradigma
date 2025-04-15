/**
 * Gets the JWT token from the request headers
 * @param headers - Request headers
 * @param apiKey - API key to validate against
 * @returns JWT token if found and valid, null otherwise
 */
export function getJWT(headers: Headers, apiKey: string): string | null {
  const authHeader = headers.get("authorization");
  if (!authHeader) return null;

  const [type, token] = authHeader.split(" ");
  if (type !== "Bearer") return null;

  // Validate API key if provided
  const providedApiKey = headers.get("x-api-key");
  if (providedApiKey && providedApiKey !== apiKey) {
    return null;
  }

  return token;
}
