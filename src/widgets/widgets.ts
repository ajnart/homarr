import { TablerIcon } from '@tabler/icons';
import React from 'react';
import { AreaType } from '../types/area';
import { ShapeType } from '../types/shape';

// Type of widgets which are saved to config
export type IWidget<TKey extends string, TDefinition extends IWidgetDefinition> = {
  id: TKey;
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
export type IWidgetOptionValue =
  | IMultiSelectOptionValue
  | ISwitchOptionValue
  | ITextInputOptionValue
  | ISliderInputOptionValue
  | ISelectOptionValue
  | INumberInputOptionValue
  | IDraggableListInputValue;

// Interface for data type
interface DataType {
  label: string;
  value: string;
}

// will show a multi-select with specified data
export type IMultiSelectOptionValue = {
  type: 'multi-select';
  defaultValue: string[];
  data: DataType[];
};

// will show a multi-select with specified data
export type ISelectOptionValue = {
  type: 'select';
  defaultValue: string;
  data: DataType[];
};

// will show a switch
export type ISwitchOptionValue = {
  type: 'switch';
  defaultValue: boolean;
};

// will show a text-input
export type ITextInputOptionValue = {
  type: 'text';
  defaultValue: string;
};

// will show a number-input
export type INumberInputOptionValue = {
  type: 'number';
  defaultValue: number;
};

// will show a slider-input
export type ISliderInputOptionValue = {
  type: 'slider';
  defaultValue: number;
  min: number;
  max: number;
  step: number;
};

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

// is used to type the widget definitions which will be used to display all widgets
export type IWidgetDefinition<TKey extends string = string> = {
  id: TKey;
  icon: TablerIcon | string;
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
