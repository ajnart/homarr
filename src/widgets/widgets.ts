import { TablerIcon } from '@tabler/icons';
import React from 'react';
import { AreaType } from '../types/area';
import { ShapeType } from '../types/shape';

// Type of widgets which are safed to config
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
type MakeLessSpecific<TInput extends IWidgetOptionValue['defaultValue']> = TInput extends boolean
  ? boolean
  : TInput extends number
  ? number
  : TInput extends string[]
  ? string[]
  : TInput extends string
  ? string
  : never;

// Types of options that can be specified for the widget edit modal
export type IWidgetOptionValue =
  | IMultiSelectOptionValue
  | ISwitchOptionValue
  | ITextInputOptionValue
  | ISliderInputOptionValue
  | INumberInputOptionValue;

// will show a multi-select with specified data
export type IMultiSelectOptionValue = {
  type: 'multi-select';
  defaultValue: string[];
  data: string[];
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
