import { useEffect, useRef } from 'react';
import { useGamepad } from '../contexts/GamepadContext';

export const useFocusable = (id) => {
    const ref = useRef(null);
    const { registerFocusable, unregisterFocusable } = useGamepad();

    useEffect(() => {
        const element = ref.current;
        if (element) {
            registerFocusable(id, element);
            return () => unregisterFocusable(id);
        }
    }, [id, registerFocusable, unregisterFocusable]);

    return ref;
};