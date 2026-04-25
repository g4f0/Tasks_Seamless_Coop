import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { DataService } from './DataService';
import * as p2p from '../p2p/p2p.browser';

interface DataContextValue {
  dataService: DataService;
}

const DataContext = createContext<DataContextValue | null>(null);

const dataService = DataService.getInstance();

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  useEffect(() => {
    p2p.connect(dataService).catch(console.error);
    return () => { p2p.disconnect().catch(console.error); };
  }, []);

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

export const useP2PStatus = () => {
  const [connected, setConnected] = useState(p2p.isConnected());
  useEffect(() => {
    const unsub = p2p.onConnectionChange(setConnected);
    return unsub;
  }, []);
  return connected;
};

export const useDataObserver = () => {
  const dataService = useDataService();
  const [, forceUpdate] = useState(0);
  useEffect(() => {
    const unsubscribe = dataService.subscribe(() => forceUpdate(n => n + 1));
    return unsubscribe;
  }, [dataService]);
};
