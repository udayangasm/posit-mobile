import React, { createContext, useContext, useState, ReactNode } from 'react';

interface GlobalContextType {
  token: string | null; // Store the authentication token
  setToken: React.Dispatch<React.SetStateAction<string | null>>; // Setter for token
  verifiedUserName: string | null; // Renamed from username to verifiedUserName
  setVerifiedUserName: (verifiedUserName: string) => void; // Setter for verifiedUserName
}

const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

interface GlobalProviderProps {
  children: ReactNode;
}

export const GlobalProvider: React.FC<GlobalProviderProps> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null); // Token for authentication
  const [verifiedUserName, setVerifiedUserName] = useState<string | null>(null); // Verified username

  return (
    <GlobalContext.Provider value={{ token, setToken, verifiedUserName, setVerifiedUserName }}>
      {children}
    </GlobalContext.Provider>
  );
};

export const useGlobalValue = (): GlobalContextType => {
  const context = useContext(GlobalContext);

  if (!context) {
    throw new Error('useGlobalValue must be used within a GlobalProvider');
  }

  return context;
};
