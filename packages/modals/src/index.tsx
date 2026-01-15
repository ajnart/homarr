"use client";

import type { PropsWithChildren } from "react";
import { createContext, useCallback, useContext, useEffect, useReducer, useRef, useState } from "react";
import { getDefaultZIndex, Modal } from "@mantine/core";
import { randomId } from "@mantine/hooks";

import type { stringOrTranslation } from "@homarr/translation";
import { translateIfNecessary } from "@homarr/translation";
import { useI18n } from "@homarr/translation/client";

import type { ConfirmModalProps } from "./confirm-modal";
import { ConfirmModal } from "./confirm-modal";
import type { ModalsState, ModalStateWithReference } from "./reducer";
import { modalReducer } from "./reducer";
import type { inferInnerProps, ModalDefinition } from "./type";

interface ModalContextProps {
  openModalInner: <TModal extends ModalDefinition>(props: {
    modal: TModal;
    innerProps: inferInnerProps<TModal>;
    options: OpenModalOptions;
  }) => void;
  closeModal: (id: string) => void;
}

export const ModalContext = createContext<ModalContextProps | null>(null);

export const ModalProvider = ({ children }: PropsWithChildren) => {
  const [state, dispatch] = useReducer(modalReducer, {
    modals: [],
    current: null,
  });
  const stateRef = useRef(state);
  stateRef.current = state;

  const closeModal = useCallback(
    (id: string, canceled?: boolean) => {
      dispatch({ type: "CLOSE", modalId: id, canceled });
    },
    [dispatch],
  );

  const openModalInner: ModalContextProps["openModalInner"] = useCallback(
    ({ modal, innerProps, options }) => {
      const id = randomId();
      const { title, ...rest } = options;
      dispatch({
        type: "OPEN",
        modal: {
          id,
          modal,
          props: {
            ...modal.options,
            ...rest,
            defaultTitle: title ?? modal.options.defaultTitle,
            innerProps,
          },
        },
      });
      return id;
    },
    [dispatch],
  );

  const handleCloseModal = useCallback(() => state.current && closeModal(state.current.id), [closeModal, state]);

  const activeModals = state.modals.filter((modal) => modal.id === state.current?.id || modal.props.keepMounted);

  return (
    <ModalContext.Provider value={{ openModalInner, closeModal }}>
      {activeModals.map((modal) => (
        <ActiveModal key={modal.id} modal={modal} state={state} handleCloseModal={handleCloseModal} />
      ))}

      {children}
    </ModalContext.Provider>
  );
};

interface ActiveModalProps {
  modal: ModalStateWithReference;
  state: ModalsState;
  handleCloseModal: () => void;
}

const ActiveModal = ({ modal, state, handleCloseModal }: ActiveModalProps) => {
  const t = useI18n();

  // The below code is used to animate the modal when it opens (using the transition)
  // It is necessary as transition is not working when the modal is directly mounted and run
  const [opened, setOpened] = useState(false);
  useEffect(() => {
    setTimeout(() => setOpened(true), 0);
  }, []);

  const { defaultTitle: _ignored, ...otherModalProps } = modal.reference.modalProps;

  return (
    <Modal
      key={modal.id}
      zIndex={getDefaultZIndex("modal") + 1}
      style={{
        userSelect: modal.id === state.current?.id ? undefined : "none",
      }}
      styles={{
        title: {
          fontSize: "1.25rem",
          fontWeight: 500,
        },
        inner: {
          display: modal.id === state.current?.id ? undefined : "none",
        },
      }}
      trapFocus={modal.id === state.current?.id}
      {...otherModalProps}
      title={translateIfNecessary(t, modal.props.defaultTitle)}
      opened={opened}
      onClose={handleCloseModal}
    >
      {modal.reference.content}
    </Modal>
  );
};

interface OpenModalOptions {
  keepMounted?: boolean;
  title?: stringOrTranslation;
}

export const useModalAction = <TModal extends ModalDefinition>(modal: TModal) => {
  const context = useContext(ModalContext);

  if (!context) throw new Error("ModalContext is not provided");

  return {
    openModal: (innerProps: inferInnerProps<TModal>, options: OpenModalOptions | void) => {
      // void actually is undefined
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      context.openModalInner({ modal, innerProps, options: options ?? {} });
    },
  };
};

export const useConfirmModal = () => {
  const { openModal } = useModalAction(ConfirmModal);

  return {
    openConfirmModal: (props: ConfirmModalProps) => openModal(props, { title: props.title }),
  };
};
