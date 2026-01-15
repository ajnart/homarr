"use client";

import { useContext } from "react";

import { ModalContext } from ".";
import type { ModalDefinition, ModalState } from "./type";

export type ModalStateWithReference = ModalState & {
  /**
   * Reference to modal component instance
   * Used so the modal can be persisted between navigating in newer modals
   */
  reference: ReturnType<typeof getModal>;
};

export interface ModalsState {
  modals: ModalStateWithReference[];

  /**
   * Modal that is currently open or was the last open one.
   * Keeping the last one is necessary for providing a clean exit transition.
   */
  current: ModalStateWithReference | null;
}

interface OpenAction {
  type: "OPEN";
  modal: ModalState;
}

interface CloseAction {
  type: "CLOSE";
  modalId: string;
  canceled?: boolean;
}

interface CloseAllAction {
  type: "CLOSE_ALL";
  canceled?: boolean;
}

export const modalReducer = (state: ModalsState, action: OpenAction | CloseAction | CloseAllAction): ModalsState => {
  switch (action.type) {
    case "OPEN": {
      const newModal = {
        ...action.modal,
        reference: getModal(action.modal),
      };
      return {
        current: newModal,
        modals: [...state.modals, newModal],
      };
    }
    case "CLOSE": {
      const modal = state.modals.find((modal) => modal.id === action.modalId);
      if (!modal) {
        return state;
      }

      modal.props.onClose?.();

      const remainingModals = state.modals.filter((modal) => modal.id !== action.modalId);

      return {
        current: remainingModals[remainingModals.length - 1] ?? state.current,
        modals: remainingModals,
      };
    }
    case "CLOSE_ALL": {
      if (!state.modals.length) {
        return state;
      }

      // Resolve modal stack from top to bottom
      state.modals
        .concat()
        .reverse()
        .forEach((modal) => {
          modal.props.onClose?.();
        });

      return {
        current: state.current,
        modals: [],
      };
    }
    default: {
      return state;
    }
  }
};

const getModal = <TModal extends ModalDefinition>(modal: ModalState<TModal>) => {
  const ModalContent = modal.modal.component;

  const { innerProps, ...rest } = modal.props;
  const FullModal = () => {
    const context = useContext(ModalContext);

    if (!context) {
      throw new Error("Modal component used outside of modal context");
    }

    return (
      <ModalContent
        innerProps={innerProps}
        actions={{
          closeModal: () => context.closeModal(modal.id),
        }}
      />
    );
  };

  return {
    modalProps: rest,
    content: <FullModal />,
  };
};
