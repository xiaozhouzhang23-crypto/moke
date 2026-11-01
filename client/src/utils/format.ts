export function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(
    date.getHours(),
  )}:${pad(date.getMinutes())}`;
}

export function formatDay(value: string): string {
  return formatDate(value).slice(0, 10);
}

export function initialOf(name: string): string {
  return name.trim().charAt(0).toUpperCase() || '?';
}
