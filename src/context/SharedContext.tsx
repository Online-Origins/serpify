"use client";
import React, { createContext, useContext, useState, ReactNode } from "react";

interface SharedContextProps {
  sharedData: string | null;
  setSharedData: (data: any) => void;
  currentUrl: string | null;
  setCurrentUrl: (data: any) => void;
  userAccessToken: string | null;
  setUserAccessToken: (data: any) => void;
  webData: any;
  setWebData: (data: any) => void;
  pagesData: any;
  setPagesData: (data: any) => void;
  queryData: any;
  setQueryData: (data: any) => void;
  availableDomains: any;
  setAvailableDomains: (data: any) => void;
  contentKeywords: any;
  setContentKeywords: (data: any) => void;
}

const SharedContext = createContext<SharedContextProps | undefined>(undefined);

export const SharedProvider = ({ children }: { children: ReactNode }) => {
  const [sharedData, setSharedData] = useState<string | null>(null);
  const [currentUrl, setCurrentUrl] = useState<string | null>(null);
  const [userAccessToken, setUserAccessToken] = useState<string | null>(null);
  const [webData, setWebData] = useState();
  const [pagesData, setPagesData] = useState();
  const [queryData, setQueryData] = useState();
  const [availableDomains, setAvailableDomains] = useState<any[]>([]);
  const [contentKeywords, setContentKeywords] = useState<any[]>([]);

  return (
    <SharedContext.Provider
      value={{
        sharedData,
        setSharedData,
        currentUrl,
        setCurrentUrl,
        userAccessToken,
        setUserAccessToken,
        webData,
        setWebData,
        pagesData,
        setPagesData,
        queryData,
        setQueryData,
        availableDomains,
        setAvailableDomains,
        contentKeywords,
        setContentKeywords,
      }}
    >
      {children}
    </SharedContext.Provider>
  );
};

export const useSharedContext = (): SharedContextProps => {
  const context = useContext(SharedContext);
  if (!context) {
    throw new Error("useSharedContext must be used within a SharedProvider");
  }
  return context;
};
