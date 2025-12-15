import { z } from 'zod';

export const YearSchema = z.union([z.string(), z.number(), z.date()]).transform((val) => {
  if (typeof val === 'string') {
    const num = parseInt(val, 10);
    if (isNaN(num)) throw new Error('Invalid year string');
    return new Date(num, 0, 1); // Jan 1 of that year
  }
  if (typeof val === 'number') {
    return new Date(val, 0, 1); // Jan 1 of that year
  }
  if (val instanceof Date) {
    // Normalize to Jan 1 of that year
    return new Date(val.getFullYear(), 0, 1);
  }
  throw new Error('Invalid year input');
});
