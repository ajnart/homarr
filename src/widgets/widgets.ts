import {
  MultiSelectProps,
  NumberInputProps,
  SelectProps,
  SliderProps,
  SwitchProps,
  TextInputProps,
} from '@mantine/core';
import { Icon } from '@tabler/icons-react';
import React from 'react';
import { IntegrationType } from '~/types/app';
import { AreaType } from '~/types/area';
import { ShapeType } from '~/types/shape';

// Type of widgets which are saved to config
export type IWidget<TKey extends string, TDefinition extends IWidgetDefinition> = {
  id: string;
  type: TKey;
  properties: {
    [key in keyof TDefinition['options']]: MakeLessSpecific<
      TDefinition['options'][key]['defaultValue']
    >;
  };
  area: AreaType;
  shape: ShapeType;
};

// Makes the type less specific
// For example when the type true is used as input the result is boolean
// By not using this type the definition would always be { property: true }
type MakeLessSpecific<T> = T extends boolean ? boolean : T;

// Types of options that can be specified for the widget edit modal
export type IWidgetOptionValue = (
  | IMultiSelectOptionValue
  | ISwitchOptionValue
  | ITextInputOptionValue
  | ISliderInputOptionValue
  | ISelectOptionValue
  | INumberInputOptionValue
  | IDraggableListInputValue
  | IDraggableEditableListInputValue<any>
  | IMultipleTextInputOptionValue
  | ILocationOptionValue
) &
  ICommonWidgetOptions;

// Interface for data type
interface DataType {
  label?: string;
  value: string;
}

interface ICommonWidgetOptions {
  info?: boolean;
  hide?: boolean;
  infoLink?: string;
}

// will show a multi-select with specified data
export type IMultiSelectOptionValue = {
  type: 'multi-select';
  defaultValue: string[];
  data: DataType[] | (() => DataType[]);
  inputProps?: Partial<MultiSelectProps>;
};

// will show a select with specified data
export type ISelectOptionValue = {
  type: 'select';
  defaultValue: string;
  data: DataType[] | (() => DataType[]);
  inputProps?: Partial<SelectProps>;
};

// will show a switch
export type ISwitchOptionValue = {
  type: 'switch';
  defaultValue: boolean;
  inputProps?: Partial<SwitchProps>;
};

// will show a text-input
export type ITextInputOptionValue = {
  type: 'text';
  defaultValue: string;
  inputProps?: Partial<TextInputProps>;
};

// will show a number-input
export type INumberInputOptionValue = {
  type: 'number';
  defaultValue: number;
  inputProps?: Partial<NumberInputProps>;
};

// will show a slider-input
export type ISliderInputOptionValue = {
  type: 'slider';
  defaultValue: number;
  min: number;
  max: number;
  step: number;
  inputProps?: Partial<SliderProps>;
};

// will show a custom location selector
type ILocationOptionValue = {
  type: 'location';
  defaultValue: { latitude: number; longitude: number };
};

// will show a sortable list that can have sub settings
export type IDraggableListInputValue = {
  type: 'draggable-list';
  defaultValue: {
    key: string;
    subValues?: Record<string, any>;
  }[];
  items: Record<
    string,
    Record<string, Omit<Exclude<IWidgetOptionValue, IDraggableListInputValue>, 'defaultValue'>>
  >;
};

export type IDraggableEditableListInputValue<TData extends { id: string }> = {
  type: 'draggable-editable-list';
  defaultValue: TData[];
  create: () => TData;
  getLabel: (data: TData) => string | JSX.Element;
  itemComponent: (props: {
    data: TData;
    onChange: (data: TData) => void;
    delete: () => void;
  }) => JSX.Element;
};

// will show a text-input with a button to add a new line
export type IMultipleTextInputOptionValue = {
  type: 'multiple-text';
  defaultValue: string[];
  inputProps?: Partial<TextInputProps>;
};

// is used to type the widget definitions which will be used to display all widgets
export type IWidgetDefinition<TKey extends string = string> = {
  id: TKey;
  icon: Icon | string;
  options: {
    [key: string]: IWidgetOptionValue;
  };
  gridstack: {
    minWidth: number;
    minHeight: number;
    maxWidth: number;
    maxHeight: number;
  };
  component: React.ComponentType<any>;
};
