import React, { useState, useEffect, useCallback } from 'react';
import { useSettings } from '../contexts/SettingsContext';
import { defaultKeymap } from '../contexts/SettingsContext';

const actionLabels = {
  confirm: '決定/進む',
  cancel: 'キャンセル/戻る',
  menu: 'メニュー',
  special: '特殊アクション',
};

const ControllerSettings = () => {
  const { settings, setSettings } = useSettings();
  const [listeningFor, setListeningFor] = useState(null);

  const handleKeymapChange = useCallback((action, buttonIndex) => {
    setSettings(prev => ({
      ...prev,
      keymap: {
        ...prev.keymap,
        [action]: buttonIndex,
      },
    }));
    setListeningFor(null);
  }, [setSettings]);

  useEffect(() => {
    if (!listeningFor) return;

    const handleButtonDown = (e) => {
      // どのボタンでも設定できるように、actionの重複チェックはしない
      handleKeymapChange(listeningFor, e.detail.buttonIndex);
    };

    window.addEventListener('gamepadbuttondown', handleButtonDown);
    const timeoutId = setTimeout(() => {
      console.log("Button assignment timed out.");
      setListeningFor(null);
    }, 5000);

    return () => {
      window.removeEventListener('gamepadbuttondown', handleButtonDown);
      clearTimeout(timeoutId);
    };
  }, [listeningFor, handleKeymapChange]);

  const keymap = settings.keymap || defaultKeymap;

  return (
    <section className="bg-white/5 p-6 rounded-lg">
      <h2 className="text-2xl font-semibold mb-4">コントローラー設定</h2>
      <div className="space-y-3">
        {Object.entries(actionLabels).map(([action, label]) => (
          <div key={action} className="flex items-center justify-between bg-black/20 p-3 rounded-md">
            <span className="font-medium">{label}</span>
            <div className="flex items-center gap-4">
              <span className="text-purple-400 font-mono w-20 text-center">Button {keymap[action]}</span>
              <button
                onClick={() => setListeningFor(action)}
                className={`px-4 py-1 rounded-md text-sm font-semibold w-28 text-center transition-colors ${
                  listeningFor === action
                    ? 'bg-yellow-500 animate-pulse'
                    : 'bg-slate-600 hover:bg-slate-500'
                }`}
              >
                {listeningFor === action ? '入力待機中...' : '変更'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ControllerSettings;