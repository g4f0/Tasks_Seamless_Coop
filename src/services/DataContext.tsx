import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { DataService } from './DataService';

interface DataContextValue { dataService: DataService; }

const DataContext = createContext<DataContextValue | null>(null);
const dataService = DataService.getInstance();

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <DataContext.Provider value={{ dataService }}>
      {children}
    </DataContext.Provider>
  );
};

export const useDataService = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error("useDataService debe usarse dentro de DataProvider");
  return context.dataService;
};

export const useDataObserver = () => {
  const ds = useDataService();
  const [, forceUpdate] = useState(0);
  useEffect(() => {
    const unsub = ds.subscribe(() => forceUpdate(n => n + 1));
    return unsub;
  }, [ds]);
};
