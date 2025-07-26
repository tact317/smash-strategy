import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { AuthProvider } from './contexts/AuthContext';
import { AudioSettingsProvider } from './contexts/AudioSettingsContext';
import { DataProvider } from './contexts/DataContext';
import { GamepadProvider } from './contexts/GamepadContext';
import { ModalProvider } from './contexts/ModalContext';
import { PlayerStatsProvider } from './contexts/PlayerStatsContext';
import { SettingsProvider } from './contexts/SettingsContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { UIProvider } from './contexts/UIContext';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <SettingsProvider>
          <AudioSettingsProvider>
            <UIProvider>
              <DataProvider>
                <PlayerStatsProvider>
                  <GamepadProvider>
                    <ModalProvider>
                      <App />
                    </ModalProvider>
                  </GamepadProvider>
                </PlayerStatsProvider>
              </DataProvider>
            </UIProvider>
          </AudioSettingsProvider>
        </SettingsProvider>
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>
);
