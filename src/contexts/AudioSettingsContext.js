import React, { createContext, useState, useEffect, useContext } from 'react';
import { loadFromLocalStorage, saveToLocalStorage } from '../utils';

const AudioSettingsContext = createContext();

export const useAudioSettings = () => useContext(AudioSettingsContext);

// ★ 設定の初期値を定義
const initialSettings = {
    isBgmEnabled: true,
    isSeEnabled: true,
    bgmVolume: 0.3,
    seVolume: 0.5,
};

// ★ BGMやSEの割り当ての初期値を定義
const initialAssignments = {
    bgm_splash: 'bgm_main_smash',
    bgm_home: 'bgm_main_dark',
    se_click: 'se_click_default',
};

export const AudioSettingsProvider = ({ children }) => {
    const [settings, setSettings] = useState(() => loadFromLocalStorage('smashAppAudioSettings', initialSettings));
    const [assignments, setAssignments] = useState(() => loadFromLocalStorage('smashAppAudioAssignments', initialAssignments));

    useEffect(() => {
        saveToLocalStorage('smashAppAudioSettings', settings);
    }, [settings]);

    useEffect(() => {
        saveToLocalStorage('smashAppAudioAssignments', assignments);
    }, [assignments]);

    // 汎用的なセッター関数
    const setSetting = (key, value) => setSettings(s => ({ ...s, [key]: value }));
    const setAssignment = (key, itemId) => setAssignments(a => ({ ...a, [key]: itemId }));

    const value = {
        settings,
        setSetting,
        assignments,
        setAssignment,
    };

    return (
        <AudioSettingsContext.Provider value={value}>
            {children}
        </AudioSettingsContext.Provider>
    );
};