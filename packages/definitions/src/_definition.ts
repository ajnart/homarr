export const createDefinition = <const TKeys extends string[], TOptions extends { defaultValue: TKeys[number] } | void>(
  values: TKeys,
  options: TOptions,
) => ({
  values,
  defaultValue: options?.defaultValue as TOptions extends {
    defaultValue: infer T;
  }
    ? T
    : undefined,
});

export type inferDefinitionType<TDefinition> = TDefinition extends {
  values: readonly (infer T)[];
}
  ? T
  : never;
