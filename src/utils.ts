import { format, getTime } from 'date-fns';

export const printDate = (timestamp?: number): string => {
  if (!timestamp) {
    return format(new Date(), "dd MMM yyyy");
  }
  return format(new Date(timestamp), "dd MMM yyyy");
}

export const dateToTimestamp = (str: string): number => {
  return getTime(str);
}

export const getCurrentTimestamp = (): number => {
  return getTime(new Date());
}