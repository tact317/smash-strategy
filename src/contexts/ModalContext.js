import React, { createContext, useState, useContext, useCallback } from 'react';
import ConfirmModal from '../components/ConfirmModal';

const ModalContext = createContext();

export const useModal = () => useContext(ModalContext);

export const ModalProvider = ({ children }) => {
    const [modalState, setModalState] = useState(null);

    const showConfirm = useCallback((title, message) => {
        return new Promise((resolve) => {
            setModalState({
                title,
                message,
                onConfirm: () => {
                    setModalState(null);
                    resolve(true);
                },
                onCancel: () => {
                    setModalState(null);
                    resolve(false);
                },
            });
        });
    }, []);

    return (
        <ModalContext.Provider value={{ showConfirm }}>
            {children}
            {modalState && <ConfirmModal {...modalState} />}
        </ModalContext.Provider>
    );
};