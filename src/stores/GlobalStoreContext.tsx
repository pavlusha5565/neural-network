import React from "react";

export interface IStoreContext {}

const stores = {};

export const StoreContext = React.createContext<IStoreContext>(stores);

export function StoreProvider({ children }: { children: React.ReactElement }) {
  return (
    <StoreContext.Provider value={stores}>{children}</StoreContext.Provider>
  );
}

export function useGlobalStore(store?: string): IStoreContext {
  return React.useContext<IStoreContext>(StoreContext);
}
