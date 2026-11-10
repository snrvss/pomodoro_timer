/*
 * Paths of the DummyJSON quote endpoints, relative to the RestClient's base URL
 * (e.g. `https://dummyjson.com`).
 */

/**
 * Builds the endpoint paths.
 */
export const quoteEndpoints = {
  /** `GET quotes/random/{count}`: an array of `count` random quotes */
  random: (count: number) => `quotes/random/${encodeURIComponent(String(count))}`,
} as const
