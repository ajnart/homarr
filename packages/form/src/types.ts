import type { ChangeEvent, FocusEvent } from "react";

export interface InputPropsFor<T, TOnChangeArg, TComponent extends HTMLElement = HTMLInputElement> extends BasePropsFor<
  TOnChangeArg,
  TComponent
> {
  value?: T;
  defaultValue?: T;
}

interface BasePropsFor<TOnChangeArg, TComponent extends HTMLElement> {
  onChange: (value: TOnChangeArg) => void;
  error?: string;
  onBlur?: (event: FocusEvent<TComponent>) => void;
  onFocus?: (event: FocusEvent<TComponent>) => void;
}

export interface CheckboxProps<
  TOnChangeArg = ChangeEvent<HTMLInputElement>,
  TComponent extends HTMLElement = HTMLInputElement,
> extends BasePropsFor<TOnChangeArg, TComponent> {
  checked?: boolean;
}
