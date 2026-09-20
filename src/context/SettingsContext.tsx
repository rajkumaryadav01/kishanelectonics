import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ShopSettings } from '../types';
import { api } from '../services/api';

const DEFAULT_SETTINGS: ShopSettings = {
  shopName: 'Kishan Electronics',
  tagline: 'Your Trusted ECE & Electronics Components Store',
  phone: '+91 98765 43210',
  whatsappNumber: '+91 98765 43210',
  email: 'contact@kishanelectronics.com',
  address: 'Shop #14, Nehru Electronics Complex, Station Road, Tech Hub, Pune, Maharashtra 411001',
  openingHours: 'Mon - Sat: 9:30 AM - 8:30 PM | Sunday: 10:00 AM - 2:00 PM',
  googleMapsUrl: 'https://maps.google.com/?q=Nehru+Electronics+Complex+Pune',
  googleMapsEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3783.2!2d73.85!3d18.52!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTjCsDMxJzEyLjAiTiA3M8KwNTEnMDAuMCJF!5e0!3m2!1sen!2sin!4v1600000000000!5m2!1sen!2sin',
  deliveryAvailable: true,
  pickupAvailable: true,
  pickupNotice: 'Your order will be prepared and can be collected from Kishan Electronics store pickup counter.',
  currency: '₹',
  currencyCode: 'INR',
  taxPercent: 0,
  lowStockThreshold: 10,
  deliveryFee: 49,
  freeDeliveryThreshold: 499,
};

interface SettingsContextType {
  settings: ShopSettings;
  loading: boolean;
  refreshSettings: () => Promise<void>;
  updateSettings: (newSettings: Partial<ShopSettings>) => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<ShopSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchSettings = async () => {
    try {
      const data = await api.getSettings();
      if (data && data.shopName) {
        setSettings(data);
      }
    } catch (err) {
      console.warn('Using default store settings fallback:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (newSettings: Partial<ShopSettings>) => {
    await api.admin.updateSettings(newSettings);
    await fetchSettings();
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return (
    <SettingsContext.Provider
      value={{
        settings,
        loading,
        refreshSettings: fetchSettings,
        updateSettings,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings(): SettingsContextType {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
