import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { DataProvider } from './contexts/DataContext';
import { SettingsProvider } from './contexts/SettingsContext';
import { UIProvider } from './contexts/UIContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { AudioSettingsProvider } from './contexts/AudioSettingsContext';
import { PlayerStatsProvider } from './contexts/PlayerStatsContext';
import { ModalProvider } from './contexts/ModalContext';
import { AuthProvider } from './contexts/AuthContext';
import { GamepadProvider } from './contexts/GamepadContext'; // ★ 新規インポート

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ThemeProvider>
      <AudioSettingsProvider>
        <PlayerStatsProvider>
          <AuthProvider>
            <SettingsProvider>
              <DataProvider>
                <UIProvider>
                  <ModalProvider>
                    {/* ★ GamepadProviderでAppを囲む */}
                    <GamepadProvider>
                      <App />
                    </GamepadProvider>
                  </ModalProvider>
                </UIProvider>
              </DataProvider>
            </SettingsProvider>
          </AuthProvider>
        </PlayerStatsProvider>
      </AudioSettingsProvider>
    </ThemeProvider>
  </React.StrictMode>
);