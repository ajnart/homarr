import type React from "react";
import type { DraggableAttributes, UniqueIdentifier } from "@dnd-kit/core";
import type { ActionIconProps } from "@mantine/core";
import { z } from "zod/v4";
import type { ZodType } from "zod/v4";

import type { IntegrationKind } from "@homarr/definitions";

import type { inferSelectOptionValue, SelectOption } from "./_inputs/widget-select-input";
import type { ReleasesRepository } from "./releases/releases-repository";

interface CommonInput<TType> {
  defaultValue?: TType;
  withDescription?: boolean;
}

interface TextInput extends CommonInput<string> {
  validate?: z.ZodType<string>;
}

interface MultiSelectInput<TOptions extends SelectOption[]> extends CommonInput<
  inferSelectOptionValue<TOptions[number]>[]
> {
  options: TOptions;
  searchable?: boolean;
}

export interface SortableItemListInput<TItem, TOptionValue extends UniqueIdentifier> extends Omit<
  CommonInput<TOptionValue[]>,
  "withDescription"
> {
  AddButton: (props: { addItem: (item: TItem) => void; values: TOptionValue[] }) => React.ReactNode;
  ItemComponent: (props: {
    item: TItem;
    removeItem: () => void;
    rootAttributes: DraggableAttributes;
    handle: (props: Partial<Pick<ActionIconProps, "size" | "color" | "variant">>) => React.ReactNode;
  }) => React.ReactNode;
  uniqueIdentifier: (item: TItem) => TOptionValue;
  useData: (values: TOptionValue[]) => { data: TItem[] | undefined; isLoading: boolean; error: unknown };
}

interface SelectInput<TOptions extends readonly SelectOption[]> extends CommonInput<
  inferSelectOptionValue<TOptions[number]>
> {
  options: TOptions;
  searchable?: boolean;
}

interface NumberInput extends CommonInput<number> {
  validate: z.ZodNumber;
  step?: number;
}

interface SliderInput extends CommonInput<number> {
  validate: z.ZodNumber;
  step?: number;
}

export interface OptionLocation {
  name: string;
  latitude: number;
  longitude: number;
}

const optionsFactory = {
  switch: (input?: CommonInput<boolean>) => ({
    type: "switch" as const,
    defaultValue: input?.defaultValue ?? false,
    withDescription: input?.withDescription ?? false,
  }),
  text: (input?: TextInput) => ({
    type: "text" as const,
    defaultValue: input?.defaultValue ?? "",
    withDescription: input?.withDescription ?? false,
    validate: input?.validate,
  }),
  multiSelect: <const TOptions extends SelectOption[]>(input: MultiSelectInput<TOptions>) => ({
    type: "multiSelect" as const,
    defaultValue: input.defaultValue ?? [],
    options: input.options,
    searchable: input.searchable ?? false,
    withDescription: input.withDescription ?? false,
  }),
  select: <const TOptions extends SelectOption[]>(input: SelectInput<TOptions>) => ({
    type: "select" as const,
    defaultValue: (input.defaultValue ?? input.options[0]) as inferSelectOptionValue<TOptions[number]>,
    options: input.options,
    searchable: input.searchable ?? false,
    withDescription: input.withDescription ?? false,
  }),
  number: (input: NumberInput) => ({
    type: "number" as const,
    defaultValue: input.defaultValue ?? 0,
    step: input.step,
    withDescription: input.withDescription ?? false,
    validate: input.validate,
  }),
  slider: (input: SliderInput) => ({
    type: "slider" as const,
    defaultValue: input.defaultValue ?? input.validate.minValue ?? 0,
    step: input.step,
    withDescription: input.withDescription ?? false,
    validate: input.validate,
  }),
  location: (input?: CommonInput<OptionLocation>) => ({
    type: "location" as const,
    defaultValue: input?.defaultValue ?? {
      name: "",
      latitude: 0,
      longitude: 0,
    },
    withDescription: input?.withDescription ?? false,
    validate: z.object({
      name: z.string().min(1),
      latitude: z.number(),
      longitude: z.number(),
    }),
  }),
  multiText: (input?: CommonInput<string[]> & { validate?: ZodType }) => ({
    type: "multiText" as const,
    defaultValue: input?.defaultValue ?? [],
    withDescription: input?.withDescription ?? false,
    values: [] as string[],
    validate: input?.validate,
  }),
  multiReleasesRepositories: (input?: CommonInput<ReleasesRepository[]> & { validate?: ZodType }) => ({
    type: "multiReleasesRepositories" as const,
    defaultValue: input?.defaultValue ?? [],
    withDescription: input?.withDescription ?? false,
    values: [] as ReleasesRepository[],
    validate: input?.validate,
  }),
  app: () => ({
    type: "app" as const,
    defaultValue: "",
    withDescription: false,
  }),
  sortableItemList: <const TItem, const TOptionValue extends UniqueIdentifier>(
    input: SortableItemListInput<TItem, TOptionValue>,
  ) => ({
    type: "sortableItemList" as const,
    defaultValue: [] as TOptionValue[],
    itemComponent: input.ItemComponent,
    addButton: input.AddButton,
    uniqueIdentifier: input.uniqueIdentifier,
    useData: input.useData,
    withDescription: false,
  }),
};

type WidgetOptionFactory = typeof optionsFactory;

export type WidgetOptionDefinition =
  | ReturnType<WidgetOptionFactory[Exclude<keyof WidgetOptionFactory, "sortableItemList">]>
  // We allow any here as it's already type guarded with Record<string, unknown> and it still infers the correct type
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  | ReturnType<typeof optionsFactory.sortableItemList<any, any>>;
export type WidgetOptionsRecord = Record<string, WidgetOptionDefinition>;
export type WidgetOptionType = WidgetOptionDefinition["type"];
export type WidgetOptionOfType<TType extends WidgetOptionType> = Extract<WidgetOptionDefinition, { type: TType }>;

type inferOptionFromDefinition<TDefinition extends WidgetOptionDefinition> = TDefinition["defaultValue"];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type inferOptionsFromCreator<TOptions extends (settings: any) => WidgetOptionsRecord> =
  inferOptionsFromDefinition<ReturnType<TOptions>>;
export type inferOptionsFromDefinition<TOptions extends WidgetOptionsRecord> = {
  [key in keyof TOptions]: inferOptionFromDefinition<TOptions[key]>;
};

interface FieldConfiguration<TOptions extends WidgetOptionsRecord> {
  shouldHide: (options: inferOptionsFromDefinition<TOptions>, integrationKinds: IntegrationKind[]) => boolean;
}

type ConfigurationInput<TOptions extends WidgetOptionsRecord> = Partial<
  Record<keyof TOptions, FieldConfiguration<TOptions>>
>;

const createOptions = <TOptions extends WidgetOptionsRecord>(
  optionsCallback: (factory: WidgetOptionFactory) => TOptions,
  configuration?: ConfigurationInput<TOptions>,
) => {
  const obj = {} as Record<keyof TOptions, unknown>;
  const options = optionsCallback(optionsFactory);

  for (const key in options) {
    obj[key] = {
      ...configuration?.[key],
      ...options[key],
    };
  }

  return obj as {
    [key in keyof TOptions]: TOptions[key] & FieldConfiguration<TOptions>;
  };
};

type OptionsBuilder = typeof createOptions;
export type OptionsBuilderResult = ReturnType<OptionsBuilder>;

export const optionsBuilder = {
  from: createOptions,
};
