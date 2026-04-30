import { createContext, useContext } from 'react';

export const FilterContext = createContext(null);

export function useFilterContext() {
  return useContext(FilterContext);
}
