

/**
 * Helper function to format cache key params for use with ctx.db.getKey()
 */
export function formatCacheKeyParams(params: Record<string, string | number | boolean | undefined>): Array<Record<string, string>> {
  return Object.entries(params).map(([key, value]) => ({
    [key]: value?.toString() || ''
  }));
}