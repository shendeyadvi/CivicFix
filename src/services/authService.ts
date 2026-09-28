import { ApiClient } from './apiClient';

export interface UserProfile {
  id?: string;
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

  setCurrentUser(user: UserProfile, token?: string) {
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
      if (token) {
        ApiClient.setToken(token);
      }
      window.dispatchEvent(new CustomEvent('civicfix_auth_updated', { detail: user }));
    } catch {
      // ignore
    }
  },

  clearUser() {
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      ApiClient.removeToken();
      window.dispatchEvent(new CustomEvent('civicfix_auth_updated', { detail: null }));
    } catch {
      // ignore
    }
  },

  async login(email: string, password: string, role: 'citizen' | 'official'): Promise<UserProfile> {
    try {
      const response = await ApiClient.post<{ token: string; user: UserProfile }>('/api/auth/login', {
        email,
        password,
        role,
      });

      this.setCurrentUser(response.user, response.token);
      return response.user;
    } catch (err) {
      console.warn('Backend login unavailable, falling back to local session:', err);
      const fallbackUser: UserProfile = {
        name: email.includes('@') ? email.split('@')[0] : 'Civic Resident',
        email,
        role,
        isDemo: false,
      };
      this.setCurrentUser(fallbackUser);
      return fallbackUser;
    }
  },

  async register(data: Partial<UserProfile> & { password: string }): Promise<UserProfile> {
    try {
      const response = await ApiClient.post<{ token: string; user: UserProfile }>('/api/auth/register', data);
      this.setCurrentUser(response.user, response.token);
      return response.user;
    } catch (err) {
      console.warn('Backend register unavailable, falling back to local session:', err);
      const fallbackUser: UserProfile = {
        name: data.name || 'Civic Resident',
        email: data.email || 'user@example.com',
        phone: data.phone,
        role: data.role || 'citizen',
        ward: data.ward,
        department: data.department,
        employeeId: data.employeeId,
        isDemo: false,
      };
      this.setCurrentUser(fallbackUser);
      return fallbackUser;
    }
  },

  async demoLogin(role: 'citizen' | 'official'): Promise<UserProfile> {
    try {
      const response = await ApiClient.post<{ token: string; user: UserProfile }>('/api/auth/demo-login', { role });
      this.setCurrentUser(response.user, response.token);
      return response.user;
    } catch (err) {
      console.warn('Backend demo-login unavailable, using local demo profile:', err);
      const fallbackUser: UserProfile = {
        name: role === 'official' ? 'Er. Rajesh Kulkarni' : 'Aarav Deshmukh',
        email: role === 'official' ? 'officer.pmc@pune.gov.in' : 'citizen.aarav@civicfix.org',
        role,
        isDemo: true,
        ward: role === 'citizen' ? 'Ward 12 - Shivajinagar' : 'Central PMC Zone',
        department: role === 'official' ? 'Roads & Infrastructure' : undefined,
        employeeId: role === 'official' ? 'PMC-EXEC-8842' : undefined,
      };
      this.setCurrentUser(fallbackUser);
      return fallbackUser;
    }
  },

  getInitials(name: string): string {
    if (!name) return 'CF';
    const parts = name.trim().split(' ').filter(Boolean);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  },
};
