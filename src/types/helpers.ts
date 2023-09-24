export type OnlyKeysWithStructure<T, TStructure> = {
  [P in keyof T]: T[P] extends TStructure ? P : never;
}[keyof T];
