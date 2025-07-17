import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';

const GamepadContext = createContext();
export const useGamepad = () => useContext(GamepadContext);

export const GamepadProvider = ({ children }) => {
    const focusableElements = useRef(new Map());
    const [focusedId, setFocusedId] = useState(null);
    const animationFrameId = useRef();
    const lastInputTime = useRef(0);
    const buttonState = useRef(new Array(16).fill(false));
    const activeGamepadIndex = useRef(null);

    const registerFocusable = useCallback((id, element) => {
        console.log(`Registering focusable element: ${id}`);
        focusableElements.current.set(id, { element });
        if (!focusedId) {
            console.log(`Setting initial focus to: ${id}`);
            setFocusedId(id);
        }
    }, [focusedId]);

    const unregisterFocusable = useCallback((id) => {
        console.log(`Unregistering focusable element: ${id}`);
        focusableElements.current.delete(id);
        if (focusedId === id) {
            const nextElement = focusableElements.current.keys().next().value;
            setFocusedId(nextElement || null);
        }
    }, [focusedId]);

    const findNextFocus = useCallback((axisX, axisY) => {
        if (!focusedId || focusableElements.current.size < 2) return;
        const currentElement = focusableElements.current.get(focusedId)?.element;
        if (!currentElement) return;

        const currentRect = currentElement.getBoundingClientRect();
        let bestCandidate = null;
        let minDistance = Infinity;
        let direction = '';
        if (Math.abs(axisX) > Math.abs(axisY)) { direction = axisX > 0 ? 'right' : 'left'; } 
        else { direction = axisY > 0 ? 'down' : 'up'; }
        
        console.log(`Finding next focus in direction: ${direction}`);

        focusableElements.current.forEach((item, id) => {
            if (id === focusedId) return;
            const targetRect = item.element.getBoundingClientRect();
            const dx = (targetRect.left + targetRect.width / 2) - (currentRect.left + currentRect.width / 2);
            const dy = (targetRect.top + targetRect.height / 2) - (currentRect.top + currentRect.height / 2);

            let isDirectionMatch = false;
            switch(direction) {
                case 'right': isDirectionMatch = dx > 0 && Math.abs(dx) > Math.abs(dy); break;
                case 'left':  isDirectionMatch = dx < 0 && Math.abs(dx) > Math.abs(dy); break;
                case 'down':  isDirectionMatch = dy > 0 && Math.abs(dy) > Math.abs(dx); break;
                case 'up':    isDirectionMatch = dy < 0 && Math.abs(dy) > Math.abs(dx); break;
                default: break;
            }

            if (isDirectionMatch) {
                const distance = Math.hypot(dx, dy);
                if (distance < minDistance) {
                    minDistance = distance;
                    bestCandidate = id;
                }
            }
        });

        if (bestCandidate) {
            console.log(`Focus changed from ${focusedId} to ${bestCandidate}`);
            setFocusedId(bestCandidate);
        }
    }, [focusedId]);

    const gameLoop = useCallback(() => {
        if (activeGamepadIndex.current === null) {
            // スキャンを継続するためにループは止めない
            animationFrameId.current = requestAnimationFrame(gameLoop);
            return;
        }
        const gp = navigator.getGamepads()[activeGamepadIndex.current];
        if (!gp) {
            animationFrameId.current = requestAnimationFrame(gameLoop);
            return;
        }
        
        const now = performance.now();
        const AXIS_THRESHOLD = 0.7;
        const INPUT_DELAY = 150;

        if (now - lastInputTime.current > INPUT_DELAY) {
            const [axisX, axisY] = [gp.axes[0] || 0, gp.axes[1] || 0];
            if (Math.hypot(axisX, axisY) > AXIS_THRESHOLD) {
                findNextFocus(axisX, axisY);
                lastInputTime.current = now;
            }
        }
        
        gp.buttons.forEach((button, index) => {
            const wasPressed = buttonState.current[index];
            if (button.pressed && !wasPressed) {
                console.log(`Button ${index} pressed`);
                window.dispatchEvent(new CustomEvent('gamepadbuttondown', { detail: { buttonIndex: index } }));
            }
            buttonState.current[index] = button.pressed;
        });
        animationFrameId.current = requestAnimationFrame(gameLoop);
    }, [findNextFocus]);

    useEffect(() => {
        const handleGamepadConnected = (e) => {
            console.log(`Gamepad connected: ${e.gamepad.id}`);
            if (activeGamepadIndex.current === null) {
                activeGamepadIndex.current = e.gamepad.index;
            }
        };
        const handleGamepadDisconnected = (e) => {
            console.log(`Gamepad disconnected: ${e.gamepad.id}`);
            if (activeGamepadIndex.current === e.gamepad.index) {
                activeGamepadIndex.current = null;
            }
        };

        window.addEventListener("gamepadconnected", handleGamepadConnected);
        window.addEventListener("gamepaddisconnected", handleGamepadDisconnected);
        
        // 常にループを開始
        animationFrameId.current = requestAnimationFrame(gameLoop);

        return () => {
            window.removeEventListener("gamepadconnected", handleGamepadConnected);
            window.removeEventListener("gamepaddisconnected", handleGamepadDisconnected);
            if (animationFrameId.current) {
                cancelAnimationFrame(animationFrameId.current);
            }
        };
    }, [gameLoop]);

    const value = { focusedId, registerFocusable, unregisterFocusable };

    return (
        <GamepadContext.Provider value={value}>
            {children}
        </GamepadContext.Provider>
    );
};