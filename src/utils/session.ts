import { randomUUID } from 'crypto';

export const fromDate = (seconds: number, date = Date.now()) => {
  return new Date(date + seconds * 1000);
};

// Helper functions to generate unique keys and calculate the expiry dates for session cookies
export const generateSessionToken = () => {
  return randomUUID();
};
