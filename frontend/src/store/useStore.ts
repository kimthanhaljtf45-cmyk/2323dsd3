import { create } from 'zustand';
import { User, Child, ScheduleItem, ContentPost, Payment, Location, Group } from '@/types';
import { authApi, usersApi, childrenApi, scheduleApi, contentApi, paymentsApi, locationsApi, groupsApi } from '@/lib/api';

interface AppState {
  // Auth
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Data
  children: Child[];
  schedule: ScheduleItem[];
  feed: ContentPost[];
  payments: Payment[];
  locations: Location[];
  groups: Group[];
  
  // Actions
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  login: (telegramId: string, firstName: string, lastName?: string) => Promise<void>;
  logout: () => void;
  fetchUser: () => Promise<void>;
  fetchChildren: () => Promise<void>;
  fetchSchedule: (groupId?: string) => Promise<void>;
  fetchFeed: () => Promise<void>;
  fetchPayments: () => Promise<void>;
  fetchLocations: () => Promise<void>;
  fetchGroups: () => Promise<void>;
}

export const useStore = create<AppState>((set, get) => ({
  // Initial state
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  children: [],
  schedule: [],
  feed: [],
  payments: [],
  locations: [],
  groups: [],

  // Actions
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  
  setToken: (token) => {
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('token', token);
      } else {
        localStorage.removeItem('token');
      }
    }
    set({ token });
  },

  login: async (telegramId, firstName, lastName) => {
    try {
      set({ isLoading: true });
      const { data } = await authApi.mockLogin(telegramId, firstName, lastName);
      get().setToken(data.accessToken);
      set({ user: data.user, isAuthenticated: true, isLoading: false });
    } catch (error) {
      console.error('Login error:', error);
      set({ isLoading: false });
      throw error;
    }
  },

  logout: () => {
    get().setToken(null);
    set({ 
      user: null, 
      isAuthenticated: false, 
      children: [], 
      schedule: [], 
      feed: [], 
      payments: [] 
    });
    // Redirect to home page
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  },

  fetchUser: async () => {
    const token = get().token;
    if (!token) {
      set({ isLoading: false });
      return;
    }
    
    try {
      set({ isLoading: true });
      const { data } = await usersApi.getMe();
      set({ user: data, isAuthenticated: true, isLoading: false });
    } catch (error) {
      console.error('Fetch user error:', error);
      get().setToken(null);
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  fetchChildren: async () => {
    try {
      const { data } = await childrenApi.getMine();
      set({ children: data });
    } catch (error) {
      console.error('Fetch children error:', error);
    }
  },

  fetchSchedule: async (groupId) => {
    try {
      const { data } = await scheduleApi.get({ groupId });
      set({ schedule: data });
    } catch (error) {
      console.error('Fetch schedule error:', error);
    }
  },

  fetchFeed: async () => {
    try {
      const { data } = await contentApi.getFeed();
      set({ feed: data });
    } catch (error) {
      console.error('Fetch feed error:', error);
    }
  },

  fetchPayments: async () => {
    try {
      const { data } = await paymentsApi.list();
      set({ payments: data });
    } catch (error) {
      console.error('Fetch payments error:', error);
    }
  },

  fetchLocations: async () => {
    try {
      const { data } = await locationsApi.getAll();
      set({ locations: data });
    } catch (error) {
      console.error('Fetch locations error:', error);
    }
  },

  fetchGroups: async () => {
    try {
      const { data } = await groupsApi.getAll();
      set({ groups: data });
    } catch (error) {
      console.error('Fetch groups error:', error);
    }
  },
}));
