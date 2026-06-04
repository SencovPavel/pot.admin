/** Безопасно приводит значение API к массиву (защита от undefined / объекта). */
export const ensureArray = <T>(value: unknown): T[] =>
  Array.isArray(value) ? value : []
