import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { useSettings } from './SettingsContext';

const GamepadContext = createContext();

export const useGamepad = () => useContext(GamepadContext);

const AXIS_THRESHOLD = 0.75;
const AXIS_MOVE_DELAY = 180; // ms

export const GamepadProvider = ({ children }) => {
    const { settings } = useSettings();
    const [gamepads, setGamepads] = useState({});
    const [focusedId, setFocusedId] = useState(null);
    const focusableElements = useRef(new Map()).current;
    const animationFrameId = useRef(null);
    const lastAxisMoveTime = useRef(0);
    const prevButtonStates = useRef({});

    const registerFocusable = useCallback((id, element) => {
        focusableElements.set(id, element);
    }, [focusableElements]);

    const unregisterFocusable = useCallback((id) => {
        focusableElements.delete(id);
    }, [focusableElements]);

    const handleGamepadConnected = (e) => {
        console.log('Gamepad connected:', e.gamepad.id);
        setGamepads(prev => ({ ...prev, [e.gamepad.index]: e.gamepad }));
    };

    const handleGamepadDisconnected = (e) => {
        console.log('Gamepad disconnected:', e.gamepad.id);
        setGamepads(prev => {
            const newState = { ...prev };
            delete newState[e.gamepad.index];
            return newState;
        });
    };

    const handleAxisMove = useCallback((e) => {
        const { direction } = e.detail;
        const elements = Array.from(focusableElements.entries());
        if (elements.length === 0) return;

        if (!focusedId) {
            setFocusedId(elements[0][0]);
            return;
        }

        const currentIndex = elements.findIndex(([id]) => id === focusedId);
        if (currentIndex === -1) {
            setFocusedId(elements[0][0]);
            return;
        };

        const currentElement = elements[currentIndex][1];
        const currentRect = currentElement.getBoundingClientRect();

        let bestCandidate = null;
        let minDistance = Infinity;

        elements.forEach(([id, element]) => {
            if (id === focusedId) return;

            const rect = element.getBoundingClientRect();
            const dx = (rect.left + rect.right) / 2 - (currentRect.left + currentRect.right) / 2;
            const dy = (rect.top + rect.bottom) / 2 - (currentRect.top + currentRect.bottom) / 2;

            let isValidMove = false;
            if (direction === 'right' && dx > 0 && Math.abs(dx) > Math.abs(dy) * 0.5) isValidMove = true;
            if (direction === 'left' && dx < 0 && Math.abs(dx) > Math.abs(dy) * 0.5) isValidMove = true;
            if (direction === 'down' && dy > 0 && Math.abs(dy) > Math.abs(dx) * 0.5) isValidMove = true;
            if (direction === 'up' && dy < 0 && Math.abs(dy) > Math.abs(dx) * 0.5) isValidMove = true;

            if (isValidMove) {
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < minDistance) {
                    minDistance = distance;
                    bestCandidate = id;
                }
            }
        });

        if (bestCandidate) {
            setFocusedId(bestCandidate);
        }
    }, [focusableElements, focusedId]);

    const runGamepadLoop = useCallback(() => {
        const connectedGamepads = navigator.getGamepads ? navigator.getGamepads() : [];
        const now = performance.now();

        for (const gamepad of connectedGamepads) {
            if (!gamepad) continue;

            // --- Button Press Handling ---
            const currentButtonStates = gamepad.buttons.map(b => b.pressed);
            const prevStates = prevButtonStates.current[gamepad.index] || [];
            
            currentButtonStates.forEach((isPressed, buttonIndex) => {
                const wasPressed = prevStates[buttonIndex];
                if (isPressed && !wasPressed) {
                    const action = Object.keys(settings.keymap).find(key => settings.keymap[key] === buttonIndex);
                    const detail = { buttonIndex, gamepad, action: action || null };

                    // [デバッグログ] ボタンが押されたとき
                    console.log(`%c[GP ${gamepad.index}] Button Down:`, 'color: #88FF88; font-weight: bold;', { button: buttonIndex, action: action || 'N/A' });

                    window.dispatchEvent(new CustomEvent('gamepadbuttondown', { detail }));
                    if (action) {
                        window.dispatchEvent(new CustomEvent('gamepadactiondown', { detail }));
                    }
                } else if (!isPressed && wasPressed) {
                    // [デバッグログ] ボタンが離されたとき
                    console.log(`%c[GP ${gamepad.index}] Button Up:`, 'color: #FF8888; font-weight: bold;', { button: buttonIndex });

                    window.dispatchEvent(new CustomEvent('gamepadbuttonup', { detail: { buttonIndex, gamepad } }));
                }
            });
            prevButtonStates.current[gamepad.index] = currentButtonStates;

            // --- Axis (D-pad / Stick) Move Handling ---
            if (now - lastAxisMoveTime.current > AXIS_MOVE_DELAY) {
                const axes = [gamepad.axes[0], gamepad.axes[1]]; // Left stick
                if (gamepad.buttons.length > 15) { // D-pad
                    axes[0] = (gamepad.buttons[15].pressed ? 1 : 0) - (gamepad.buttons[14].pressed ? 1 : 0);
                    axes[1] = (gamepad.buttons[13].pressed ? 1 : 0) - (gamepad.buttons[12].pressed ? 1 : 0);
                }

                let direction = null;
                if (axes[1] < -AXIS_THRESHOLD) direction = 'up';
                else if (axes[1] > AXIS_THRESHOLD) direction = 'down';
                else if (axes[0] < -AXIS_THRESHOLD) direction = 'left';
                else if (axes[0] > AXIS_THRESHOLD) direction = 'right';

                if (direction) {
                    lastAxisMoveTime.current = now;

                    // [デバッグログ] スティック/D-Padが入力されたとき
                    console.log(`%c[GP ${gamepad.index}] Axis Move:`, 'color: #8888FF; font-weight: bold;', { direction });

                    window.dispatchEvent(new CustomEvent('gamepadaxismove', { detail: { direction, gamepad } }));
                }
            }
        }
        animationFrameId.current = requestAnimationFrame(runGamepadLoop);
    }, [settings.keymap]);

    useEffect(() => {
        window.addEventListener('gamepadconnected', handleGamepadConnected);
        window.addEventListener('gamepaddisconnected', handleGamepadDisconnected);
        window.addEventListener('gamepadaxismove', handleAxisMove);

        animationFrameId.current = requestAnimationFrame(runGamepadLoop);

        return () => {
            window.removeEventListener('gamepadconnected', handleGamepadConnected);
            window.removeEventListener('gamepaddisconnected', handleGamepadDisconnected);
            window.removeEventListener('gamepadaxismove', handleAxisMove);
            if (animationFrameId.current) {
                cancelAnimationFrame(animationFrameId.current);
            }
        };
    }, [runGamepadLoop, handleAxisMove]);

    const value = {
        gamepads,
        focusedId,
        setFocusedId,
        registerFocusable,
        unregisterFocusable,
        focusableElements,
    };

    return (
        <GamepadContext.Provider value={value}>
            {children}
        </GamepadContext.Provider>
    );
};