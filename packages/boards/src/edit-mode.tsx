"use client";

import type { PropsWithChildren } from "react";
import { createContext, useContext } from "react";
import { useDisclosure } from "@mantine/hooks";

const EditModeContext = createContext<ReturnType<typeof useDisclosure> | null>(null);

export const EditModeProvider = ({ children }: PropsWithChildren) => {
  const editModeDisclosure = useDisclosure(false);

  return <EditModeContext.Provider value={editModeDisclosure}>{children}</EditModeContext.Provider>;
};

export const useEditMode = () => {
  const context = useContext(EditModeContext);

  if (!context) {
    throw new Error("EditMode is required");
  }

  return context;
};
