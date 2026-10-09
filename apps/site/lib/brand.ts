/** Platform name, shared with the dashboard via the same env var. */
export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || 'GymSuite';

/** Where "Sign in" / "Get started" send people (the dashboard app). */
export const APP_URL = (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000').replace(/\/$/, '');
