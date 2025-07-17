import { useEffect, useRef } from 'react';
import { useGamepad } from '../contexts/GamepadContext';

export const useFocusable = (id) => {
    const elementRef = useRef(null);
    const { registerFocusable, unregisterFocusable } = useGamepad();

    useEffect(() => {
        const element = elementRef.current;
        if (element) {
            registerFocusable(id, element);
        }
        
        // コンポーネントが消える時に登録を解除
        return () => {
            unregisterFocusable(id);
        };
    }, [id, registerFocusable, unregisterFocusable]);

    return elementRef;
};