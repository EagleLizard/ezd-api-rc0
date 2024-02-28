
import { formatISO } from 'date-fns';

export function getISOString(date: Date): string {
  return formatISO(date);
}
