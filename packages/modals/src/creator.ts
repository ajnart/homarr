import type { CreateModalOptions, ModalComponent } from "./type";

export const createModal = <TInnerProps>(component: ModalComponent<TInnerProps>) => {
  return {
    withOptions: (options: Partial<CreateModalOptions>) => {
      return {
        component,
        options,
      };
    },
  };
};
