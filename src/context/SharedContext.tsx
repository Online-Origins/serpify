"use client"
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface SharedContextProps {
  sharedData: string | null;
  setSharedData: (data: any) => void;
}

const SharedContext = createContext<SharedContextProps | undefined>(undefined);

export const SharedProvider = ({ children }: { children: ReactNode }) => {
  const [sharedData, setSharedData] = useState<string | null>(null);

  return (
    <SharedContext.Provider value={{ sharedData, setSharedData }}>
      {children}
    </SharedContext.Provider>
  );
};

export const useSharedContext = (): SharedContextProps => {
  const context = useContext(SharedContext);
  if (!context) {
    throw new Error('useSharedContext must be used within a SharedProvider');
  }
  return context;
};
