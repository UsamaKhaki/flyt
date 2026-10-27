// The picker works with local Date objects; the rest of the app uses "YYYY-MM-DD" strings.
// Building dates from parts (not Date.parse) keeps them on the user's local calendar day.
export function isoToLocalDate(iso: string): Date {
  const [year, month, day] = iso.split('-').map(Number);
  return new Date(year ?? 1970, (month ?? 1) - 1, day ?? 1);
}

export function localDateToIso(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

const displayFormat = new Intl.DateTimeFormat('en-GB', {
  weekday: 'short',
  day: 'numeric',
  month: 'short',
});

export function formatIsoDate(iso: string): string {
  return displayFormat.format(isoToLocalDate(iso));
}
