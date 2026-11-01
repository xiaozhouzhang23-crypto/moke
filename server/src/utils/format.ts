export function toIso(value: string | Date | null): string {
  if (!value) return '';
  return value instanceof Date ? value.toISOString() : value;
}

export function nowIso(): string {
  return new Date().toISOString();
}
