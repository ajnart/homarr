import type { DependencyList, PropsWithChildren } from "react";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import type { TablerIcon } from "@homarr/ui";

import type { inferSearchInteractionDefinition, SearchInteraction } from "../../lib/interaction";

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export type ContextSpecificItem = {
  id: string;
  name: string;
  icon: TablerIcon | string;
  interaction: () => inferSearchInteractionDefinition<SearchInteraction>;
  disabled?: boolean;
};

interface SpotlightContextProps {
  items: ContextSpecificItem[];
  registerItems: (key: string, results: ContextSpecificItem[]) => void;
  unregisterItems: (key: string) => void;
}

const createSpotlightContext = (displayName: string) => {
  const SpotlightContext = createContext<SpotlightContextProps | null>(null);
  SpotlightContext.displayName = displayName;

  const Provider = ({ children }: PropsWithChildren) => {
    const [itemsMap, setItemsMap] = useState<Map<string, { items: ContextSpecificItem[]; count: number }>>(new Map());

    const registerItems = useCallback((key: string, newItems: ContextSpecificItem[]) => {
      setItemsMap((prevItems) => {
        const newItemsMap = new Map(prevItems);
        newItemsMap.set(key, { items: newItems, count: (newItemsMap.get(key)?.count ?? 0) + 1 });
        return newItemsMap;
      });
    }, []);

    const unregisterItems = useCallback((key: string) => {
      setItemsMap((prevItems) => {
        const registrationCount = prevItems.get(key)?.count ?? 0;

        if (registrationCount <= 1) {
          const newItemsMap = new Map(prevItems);
          newItemsMap.delete(key);
          return newItemsMap;
        }

        const newItemsMap = new Map(prevItems);
        newItemsMap.set(key, { items: newItemsMap.get(key)?.items ?? [], count: registrationCount - 1 });

        return prevItems;
      });
    }, []);

    const items = useMemo(() => Array.from(itemsMap.values()).flatMap(({ items }) => items), [itemsMap]);

    return (
      <SpotlightContext.Provider value={{ items, registerItems, unregisterItems }}>
        {children}
      </SpotlightContext.Provider>
    );
  };

  const useSpotlightContextItems = () => {
    const context = useContext(SpotlightContext);

    if (!context) {
      throw new Error(`useSpotlightContextItems must be used within SpotlightContext[displayName=${displayName}]`);
    }

    return context.items;
  };

  const useRegisterSpotlightContextItems = (
    key: string,
    items: ContextSpecificItem[],
    dependencyArray: DependencyList,
  ) => {
    const context = useContext(SpotlightContext);

    if (!context) {
      throw new Error(
        `useRegisterSpotlightContextItems must be used within SpotlightContext[displayName=${displayName}]`,
      );
    }

    useEffect(() => {
      context.registerItems(
        key,
        items.filter((item) => !item.disabled),
      );

      return () => {
        context.unregisterItems(key);
      };
      // We ignore the results
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [...dependencyArray, key]);
  };

  return [SpotlightContext, Provider, useSpotlightContextItems, useRegisterSpotlightContextItems] as const;
};

const [_ResultContext, ResultProvider, useSpotlightContextResults, useRegisterSpotlightContextResults] =
  createSpotlightContext("SpotlightContextSpecificResults");
const [_ActionContext, ActionProvider, useSpotlightContextActions, useRegisterSpotlightContextActions] =
  createSpotlightContext("SpotlightContextSpecificActions");

export {
  useRegisterSpotlightContextActions,
  useRegisterSpotlightContextResults,
  useSpotlightContextActions,
  useSpotlightContextResults,
};

export const SpotlightProvider = ({ children }: PropsWithChildren) => {
  return (
    <ResultProvider>
      <ActionProvider>{children}</ActionProvider>
    </ResultProvider>
  );
};
