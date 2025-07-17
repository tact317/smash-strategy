import React, { createContext, useState, useEffect, useContext } from 'react';
import { loadFromLocalStorage, saveToLocalStorage } from '../utils';

const SettingsContext = createContext();

export const useSettings = () => useContext(SettingsContext);

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(() => loadFromLocalStorage('smashAppSettings', {
    // 既存の設定
    isGuerillaEnabled: true,
    guerillaFrequency: 180000,
    // ★★★ ここから下を追記 ★★★
    startggToken: '', // APIトークン
    startggUserSlug: '', // ユーザースラッグ
  }));

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