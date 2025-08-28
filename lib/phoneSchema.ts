import { z } from 'zod';

export const phoneSchema = z.string()
  .min(10, "Phone number must be at least 10 digits")
  .max(15, "Phone number too long")
  .regex(
    /^(?:(?:(?:\+?234)|0)[7-9][01]\d{8}|(?:(?:\+?234|0)[1-9]\d{9}))$/,
    "Invalid Nigerian phone number format. Use 080..., +23480..., or 070..."
  )
  .transform((val) => {
    // Standardize to Nigerian international format
    return val.startsWith('0') 
      ? `+234${val.substring(1)}` 
      : val.startsWith('234') 
        ? `+${val}`
        : val;
  });