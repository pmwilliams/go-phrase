export function mergeTheme<T>(defaultTheme: T, override: Partial<T> = {}): T {
  return {
    ...defaultTheme,
    ...override
  }
}