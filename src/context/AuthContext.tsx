import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Address } from '../types';
import { api, getAuthToken, setAuthToken, removeAuthToken } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  addresses: Address[];
  defaultAddress: Address | null;
  isAdmin: boolean;
  login: (emailOrPhone: string | { emailOrPhone: string; password: string }, password?: string) => Promise<void>;
  register: (nameOrData: string | any, email?: string, password?: string, phone?: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  addAddress: (addr: any) => Promise<void>;
  deleteAddress: (id: string) => Promise<void>;
  setDefaultAddress: (id: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(getAuthToken());
  const [loading, setLoading] = useState<boolean>(true);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [defaultAddress, setDefaultAddressState] = useState<Address | null>(null);

  const fetchProfile = async () => {
    try {
      if (!getAuthToken()) {
        setUser(null);
        setAddresses([]);
        setDefaultAddressState(null);
        setLoading(false);
        return;
      }
      const data = await api.getMe();
      setUser(data.user);
      setAddresses(data.addresses || []);
      setDefaultAddressState(data.defaultAddress || null);
    } catch (err) {
      console.warn('Session expired or invalid token:', err);
      removeAuthToken();
      setToken(null);
      setUser(null);
      setAddresses([]);
      setDefaultAddressState(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const login = async (
    emailOrPhone: string | { emailOrPhone: string; password: string },
    password?: string
  ) => {
    const payload =
      typeof emailOrPhone === 'string'
        ? { emailOrPhone, password: password || '' }
        : emailOrPhone;
    const res = await api.login(payload);
    setAuthToken(res.token);
    setToken(res.token);
    setUser(res.user);
    await fetchProfile();
  };

  const register = async (
    nameOrData: string | any,
    email?: string,
    password?: string,
    phone?: string
  ) => {
    const payload =
      typeof nameOrData === 'string'
        ? { name: nameOrData, email: email || '', password: password || '', phone: phone || '' }
        : nameOrData;
    const res = await api.register(payload);
    setAuthToken(res.token);
    setToken(res.token);
    setUser(res.user);
    await fetchProfile();
  };

  const logout = () => {
    removeAuthToken();
    setToken(null);
    setUser(null);
    setAddresses([]);
    setDefaultAddressState(null);
  };

  const refreshUser = async () => {
    await fetchProfile();
  };

  const addAddress = async (addr: any) => {
    await api.addAddress(addr);
    await fetchProfile();
  };

  const deleteAddress = async (id: string) => {
    await api.deleteAddress(id);
    await fetchProfile();
  };

  const setDefaultAddress = async (id: string) => {
    await api.updateAddress(id, { isDefault: true });
    await fetchProfile();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        addresses,
        defaultAddress,
        isAdmin: user?.role === 'ADMIN',
        login,
        register,
        logout,
        refreshUser,
        addAddress,
        deleteAddress,
        setDefaultAddress,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
