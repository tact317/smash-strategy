import React, { createContext, useState, useEffect, useContext } from 'react';
import { loadFromLocalStorage, saveToLocalStorage } from '../utils';

const SettingsContext = createContext();

export const useSettings = () => useContext(SettingsContext);

export const defaultKeymap = {
  confirm: 0, // A or Cross
  cancel: 1,  // B or Circle
  menu: 3,    // Y or Triangle
  special: 2, // X or Square
};

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(() => {
    const defaultSettings = {
    isGuerillaEnabled: true,
    guerillaFrequency: 180000,
    startggToken: '', // APIトークン
    startggUserSlug: '', // ユーザースラッグ
    keymap: defaultKeymap, // コントローラー設定
    };
    const savedSettings = loadFromLocalStorage('smashAppSettings', {});
    return { ...defaultSettings, ...savedSettings };
  });

  useEffect(() => {
    saveToLocalStorage('smashAppSettings', settings);
  }, [settings]);
  
  // ★ 汎用的なセッター関数を追加
  const updateSetting = (key, value) => {
    setSettings(prev => ({...prev, [key]: value}));
  }

  const value = { 
    settings, 
    setSettings, // 古いコードとの互換性のため残す
    updateSetting, // 新しい汎用セッター
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};