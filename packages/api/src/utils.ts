import { format } from "date-fns";

export const printDate = (timestamp?: number): string => {
  if (!timestamp) {
    return format(new Date(), "dd MMM yyyy");
  }
  return format(new Date(timestamp), "dd MMM yyyy");
};
