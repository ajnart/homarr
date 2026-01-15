import type { JSX, ReactNode } from "react";

import type { inferSearchInteractionDefinition } from "./interaction";

export interface CreateChildrenOptionsProps<TParentOptions extends Record<string, unknown>> {
  DetailComponent: ({ options }: { options: TParentOptions }) => ReactNode;
  useActions: (options: TParentOptions, query: string) => ChildrenAction<TParentOptions>[];
}

export interface ChildrenAction<TParentOptions extends Record<string, unknown>> {
  key: string;
  Component: (option: TParentOptions) => JSX.Element;
  useInteraction: (
    option: TParentOptions,
    query: string,
  ) => inferSearchInteractionDefinition<"link" | "javaScript" | "children">;
  hide?: boolean | ((option: TParentOptions) => boolean);
}

export const createChildrenOptions = <TParentOptions extends Record<string, unknown>>(
  props: CreateChildrenOptionsProps<TParentOptions>,
) => {
  return (option: TParentOptions) => ({
    option,
    ...props,
  });
};
