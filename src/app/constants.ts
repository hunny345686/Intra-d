export const APP_CONSTANTS = {
  ROLES: {
    ADMIN: 'admin',
    USER: 'user',
    FARMER: 'farmer'
  },
  ROUTES: {
    HOME: '',
    LOGIN: 'login',
    ADMIN: 'admin',
    CONTROL: 'control',
    BUYER: 'buyer',
    SELLER: 'seller',
    APU: 'apu'
  },
  STORAGE_KEYS: {
    CURRENT_USER: 'currentUser'
  },
  SECURITY: {
    CSRF_HEADER: 'X-CSRF-Token',
    SESSION_TIMEOUT: 30 * 60 * 1000 // 30 minutes
  },
  MESSAGES: {
    LOGIN_SUCCESS: 'Login successful',
    LOGIN_FAILED: 'Invalid credentials',
    LOGOUT_SUCCESS: 'Logged out successfully',
    ACCESS_DENIED: 'Access denied',
    CSRF_ERROR: 'Security error: Invalid request'
  }
} as const;

export type UserRole = typeof APP_CONSTANTS.ROLES[keyof typeof APP_CONSTANTS.ROLES];
export type AppRoute = typeof APP_CONSTANTS.ROUTES[keyof typeof APP_CONSTANTS.ROUTES];