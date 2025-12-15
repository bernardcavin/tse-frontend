// context/NavbarContext.tsx

import { createContext, ReactNode, useCallback, useContext, useState } from 'react';

interface NavbarContextType {
  isNavbarCollapse: boolean;
  isNavbarLocked: boolean;
  lockNavbar: () => void;
  unlockNavbar: () => void;
  openNavbar: () => void;
  closeNavbar: () => void;
  toggleNavbar: () => void;
}

const NavbarContext = createContext<NavbarContextType | undefined>(undefined);

export const NavbarProvider = ({ children }: { children: ReactNode }) => {
  const [isNavbarCollapse, setNavbarCollapse] = useState(false);
  const [isNavbarLocked, setNavbarLocked] = useState(false);

  const openNavbar = useCallback(() => setNavbarCollapse(true), []);
  const closeNavbar = useCallback(() => setNavbarCollapse(false), []);
  const toggleNavbar = useCallback(() => setNavbarCollapse((prev) => !prev), []);
  const lockNavbar = useCallback(() => setNavbarLocked(true), []);
  const unlockNavbar = useCallback(() => setNavbarLocked(false), []);

  return (
    <NavbarContext.Provider
      value={{
        isNavbarCollapse,
        isNavbarLocked,
        lockNavbar,
        unlockNavbar,
        openNavbar,
        closeNavbar,
        toggleNavbar,
      }}
    >
      {children}
    </NavbarContext.Provider>
  );
};

export const useNavbar = (): NavbarContextType => {
  const context = useContext(NavbarContext);
  if (!context) {
    throw new Error('useNavbar must be used within a NavbarProvider');
  }
  return context;
};
