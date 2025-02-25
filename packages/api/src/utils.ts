import { format, formatISO, getTime } from 'date-fns';
import { Marked } from 'marked';
import DOMPurify from 'dompurify';

const marked = new Marked();

export const printDate = (timestamp?: number): string => {
  if (!timestamp) {
    return format(new Date(), "dd MMM yyyy");
  }
  return format(new Date(timestamp), "dd MMM yyyy");
}

export const printDateTime = (timestamp?: number): string => {
  if (!timestamp) {
    return format(new Date(), "dd MMM yyyy, HH:mm");
  }
  return format(new Date(timestamp), "dd MMM yyyy, HH:mm");
}

export const dateToTimestamp = (str: string): number => {
  return getTime(str);
}

export const timestampToISO = (timestamp: number): string => {
  return formatISO(new Date(timestamp)).substring(0, "yyyy-MM-ddThh:mm".length);
}

export const getCurrentTimestamp = (): number => {
  return getTime(new Date());
}

export const renderMD = (str: string): string => {
  return DOMPurify.sanitize(marked.parse(str, { async: false }));
}