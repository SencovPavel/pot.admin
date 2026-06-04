const MSK: Intl.DateTimeFormatOptions = {
  timeZone: 'Europe/Moscow',
  day: '2-digit',
  month: '2-digit',
  year: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
};

export function fmtDateMsk(iso: string | null | undefined): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('ru-RU', MSK);
}

export function fmtDateShortMsk(iso: string | null | undefined): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('ru-RU', {
    timeZone: 'Europe/Moscow',
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
  });
}

export function fmtNum(n: number): string {
  return n.toLocaleString('ru-RU');
}
