import { User, UserRole } from '../types';

const USERS_KEY = 'dpi4_users';
const CURRENT_USER_KEY = 'dpi4_current_user';

export const authService = {
  login: (name: string, role: UserRole): User => {
    const user: User = {
      id: `USR-${Math.floor(Math.random() * 10000)}`,
      name,
      role,
      email: `${name.toLowerCase().replace(' ', '.')}@example.com`
    };
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    return user;
  },

  logout: () => {
    localStorage.removeItem(CURRENT_USER_KEY);
  },

  getCurrentUser: (): User | null => {
    const stored = localStorage.getItem(CURRENT_USER_KEY);
    return stored ? JSON.parse(stored) : null;
  },

  isAuthenticated: (): boolean => {
    return !!localStorage.getItem(CURRENT_USER_KEY);
  }
};
