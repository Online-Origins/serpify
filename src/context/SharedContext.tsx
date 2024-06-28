"use client";
import React, { createContext, useContext, useState, ReactNode } from "react";

interface SharedContextProps {
  sharedData: string | null;
  setSharedData: (data: any) => void;
  currentUrl: string | null;
  setCurrentUrl: (data: any) => void;
  userRole: string | null;
  setUserRole: (data: any) => void;
  webData: any;
  setWebData: (data: any) => void;
  pagesData: any;
  setPagesData: (data: any) => void;
  queryData: any;
  setQueryData: (data: any) => void;
  webDataPrev: any;
  setWebDataPrev: (data: any) => void;
  pagesDataPrev: any;
  setPagesDataPrev: (data: any) => void;
  queryDataPrev: any;
  setQueryDataPrev: (data: any) => void;
  availableDomains: any;
  setAvailableDomains: (data: any) => void;
  contentKeyword: any;
  setContentKeyword: (data: any) => void;
  contentSubKeywords: any;
  setContentSubKeywords: (data: any) => void;
  contentCollection: any;
  setContentCollection: (data: any) => void;
  analyticsPeriod: any;
  setAnalyticsPeriod: (data: any) => void;
}

const SharedContext = createContext<SharedContextProps | undefined>(undefined);

export const SharedProvider = ({ children }: { children: ReactNode }) => {
  const [sharedData, setSharedData] = useState<string | null>(null);
  const [currentUrl, setCurrentUrl] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [webData, setWebData] = useState();
  const [pagesData, setPagesData] = useState();
  const [queryData, setQueryData] = useState();
  const [webDataPrev, setWebDataPrev] = useState();
  const [pagesDataPrev, setPagesDataPrev] = useState();
  const [queryDataPrev, setQueryDataPrev] = useState();
  const [availableDomains, setAvailableDomains] = useState<any[]>([]);
  const [contentKeyword, setContentKeyword] = useState<any>();
  const [contentSubKeywords, setContentSubKeywords] = useState<any[]>([]);
  const [contentCollection, setContentCollection] = useState<any>();
  const [analyticsPeriod, setAnalyticsPeriod] = useState<string>("");

  return (
    <SharedContext.Provider
      value={{
        sharedData,
        setSharedData,
        currentUrl,
        setCurrentUrl,
        userRole,
        setUserRole,
        webData,
        setWebData,
        pagesData,
        setPagesData,
        queryData,
        setQueryData,
        webDataPrev,
        setWebDataPrev,
        pagesDataPrev,
        setPagesDataPrev,
        queryDataPrev,
        setQueryDataPrev,
        availableDomains,
        setAvailableDomains,
        contentKeyword,
        setContentKeyword,
        contentSubKeywords,
        setContentSubKeywords,
        contentCollection,
        setContentCollection,
        analyticsPeriod, 
        setAnalyticsPeriod,
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
