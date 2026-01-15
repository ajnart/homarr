import type { ReactNode } from "react";
import type { ModalProps } from "@mantine/core";

import type { stringOrTranslation } from "@homarr/translation";

export type ModalComponent<TInnerProps> = (props: {
  actions: { closeModal: () => void };
  innerProps: TInnerProps;
}) => ReactNode;

export type CreateModalOptions = Pick<
  ModalOptions<unknown>,
  | "size"
  | "fullScreen"
  | "centered"
  | "keepMounted"
  | "withCloseButton"
  | "zIndex"
  | "scrollAreaComponent"
  | "yOffset"
  | "transitionProps"
  | "closeOnClickOutside"
  | "closeOnEscape"
> & {
  defaultTitle: stringOrTranslation;
};

export interface ModalDefinition {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  component: ModalComponent<any>;
  options: Partial<CreateModalOptions>;
}

type ModalOptions<TInnerProps> = Partial<Omit<ModalProps, "opened">> & {
  innerProps: TInnerProps;
  defaultTitle?: stringOrTranslation;
};

export interface ModalState<TModal extends ModalDefinition = ModalDefinition> {
  id: string;
  modal: TModal;
  props: ModalOptions<inferInnerProps<TModal>>;
}

export type inferInnerProps<TModal extends ModalDefinition> =
  TModal["component"] extends ModalComponent<infer P> ? P : never;
