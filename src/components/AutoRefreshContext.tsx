import { createContext, useContext, useState } from 'react';

type AutoRefreshContextType = {
  isAutoRefresh: boolean;
  toggleAutoRefresh: () => void;
};

const AutoRefreshContext = createContext<AutoRefreshContextType>({
  isAutoRefresh: false,
  toggleAutoRefresh: () => {}
});

export const AutoRefreshProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAutoRefresh, setIsAutoRefresh] = useState(false);

  const toggleAutoRefresh = () => {
    setIsAutoRefresh(prev => !prev);
  };

  return (
    <AutoRefreshContext.Provider value={{ isAutoRefresh, toggleAutoRefresh }}>
      {children}
    </AutoRefreshContext.Provider>
  );
};

export const useAutoRefresh = () => useContext(AutoRefreshContext);
