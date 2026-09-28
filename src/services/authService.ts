export interface UserProfile {
  name: string;
  email: string;
  phone?: string;
  ward?: string;
  role: 'citizen' | 'official';
  isDemo: boolean;
  department?: string;
  employeeId?: string;
}

const AUTH_STORAGE_KEY = 'civicfix_current_user';

export const AuthService = {
  getCurrentUser(): UserProfile | null {
    try {
      const data = localStorage.getItem(AUTH_STORAGE_KEY);
      if (data) {
        return JSON.parse(data) as UserProfile;
      }
    } catch {
      // ignore
    }
    return null;
  },

  setCurrentUser(user: UserProfile) {
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
      window.dispatchEvent(new CustomEvent('civicfix_auth_updated', { detail: user }));
    } catch {
      // ignore
    }
  },

  clearUser() {
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      window.dispatchEvent(new CustomEvent('civicfix_auth_updated', { detail: null }));
    } catch {
      // ignore
    }
  },

  getInitials(name: string): string {
    if (!name) return 'CF';
    const parts = name.trim().split(' ').filter(Boolean);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
};
