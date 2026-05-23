"use client";

import React, { createContext, useContext, useState, useCallback } from "react";

interface RegisterDialogContextType {
  isOpen: boolean;
  open: () => void;
  close: () => void;
}

const RegisterDialogContext = createContext<RegisterDialogContextType>({
  isOpen: false,
  open: () => {},
  close: () => {},
});

export function useRegisterDialog() {
  return useContext(RegisterDialogContext);
}

export function RegisterDialogProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  return (
    <RegisterDialogContext.Provider value={{ isOpen, open, close }}>
      {children}
    </RegisterDialogContext.Provider>
  );
}
