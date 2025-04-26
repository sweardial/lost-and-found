'use client'

import React, { createContext, ReactNode, useContext, useState } from "react";
import Modal from "./Modal";

interface ModalContextProps {
  showModal: (text: string, onConfirm: () => void, onCancel?: () => void) => void;
  hideModal: () => void;
}

const ModalContext = createContext<ModalContextProps | undefined>(undefined);

export const ModalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [modalText, setModalText] = useState("");
  const [onConfirm, setOnConfirm] = useState<() => void>(() => () => {});
  const [onCancel, setOnCancel] = useState<() => void>(() => () => {});

  const showModal = (text: string, onConfirm: () => void, onCancel?: () => void) => {
    setModalText(text);
    setOnConfirm(() => onConfirm);
    setOnCancel(() => onCancel || hideModal);
    setIsVisible(true);
  };

  const hideModal = () => {
    setIsVisible(false);
  };

  return (
    <ModalContext.Provider value={{ showModal, hideModal }}>
      {children}
      {isVisible && (
        <Modal text={modalText} onConfirm={onConfirm} onCancel={onCancel} />
      )}
    </ModalContext.Provider>
  );
};

export const useModal = (): ModalContextProps => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error("useModal must be used within a ModalProvider");
  }
  return context;
};