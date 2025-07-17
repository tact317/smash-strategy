// src/contexts/ThemeContext.js (全文)

import React, { createContext, useState, useContext, useEffect } from 'react';
import { loadFromLocalStorage, saveToLocalStorage } from '../utils';

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => loadFromLocalStorage('smashAppTheme', 'dark')); // 'dark' or 'smash'

  useEffect(() => {
    saveToLocalStorage('smashAppTheme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(currentTheme => (currentTheme === 'dark' ? 'smash' : 'dark'));
  };

  const value = {
    theme,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};