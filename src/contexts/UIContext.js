// src/contexts/UIContext.js (全文)

import React, { createContext, useState, useContext } from 'react';

const UIContext = createContext();

export const useUI = () => useContext(UIContext);

export const UIProvider = ({ children }) => {
  const [cursorVariant, setCursorVariant] = useState('default');
  const [guerillaStep, setGuerillaStep] = useState('idle');
  const [currentQuiz, setCurrentQuiz] = useState(null);

  return (
    <UIContext.Provider value={{
      cursorVariant, setCursorVariant,
      guerillaStep, setGuerillaStep,
      currentQuiz, setCurrentQuiz
    }}>
      {children}
    </UIContext.Provider>
  );
};