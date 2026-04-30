import { createContext, useContext } from 'react';

export const ClockContext = createContext(Date.now());

export function useClock() {
  return useContext(ClockContext);
}
