import React, { createContext, useContext } from 'react';

const AppDataContext = createContext();

export const useAppData = () => {
  const context = useContext(AppDataContext);
  if (!context) {
    throw new Error('useAppData must be used within AppDataProvider');
  }
  return context;
};

export const AppDataProvider = ({ children, initialData }) => {
  return (
    <AppDataContext.Provider value={initialData}>
      {children}
    </AppDataContext.Provider>
  );
};
