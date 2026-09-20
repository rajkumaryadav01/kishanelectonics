import { createContext, useContext, useState, ReactNode } from 'react';
import { Product } from '../types';

interface CompareContextType {
  compareItems: Product[];
  addToCompare: (product: Product) => void;
  removeFromCompare: (productId: string) => void;
  isInCompare: (productId: string) => boolean;
  clearCompare: () => void;
}

const CompareContext = createContext<CompareContextType | undefined>(undefined);

export function CompareProvider({ children }: { children: ReactNode }) {
  const [compareItems, setCompareItems] = useState<Product[]>([]);

  const addToCompare = (product: Product) => {
    if (compareItems.some((p) => p.id === product.id)) return;
    if (compareItems.length >= 4) {
      alert('You can compare a maximum of 4 components simultaneously.');
      return;
    }
    setCompareItems((prev) => [...prev, product]);
  };

  const removeFromCompare = (productId: string) => {
    setCompareItems((prev) => prev.filter((p) => p.id !== productId));
  };

  const isInCompare = (productId: string) => {
    return compareItems.some((p) => p.id === productId);
  };

  const clearCompare = () => {
    setCompareItems([]);
  };

  return (
    <CompareContext.Provider
      value={{
        compareItems,
        addToCompare,
        removeFromCompare,
        isInCompare,
        clearCompare,
      }}
    >
      {children}
    </CompareContext.Provider>
  );
}

export function useCompare(): CompareContextType {
  const context = useContext(CompareContext);
  if (!context) {
    throw new Error('useCompare must be used within a CompareProvider');
  }
  return context;
}
