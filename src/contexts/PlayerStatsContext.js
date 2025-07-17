import React, { createContext, useState, useEffect, useContext } from 'react';
import { loadFromLocalStorage, saveToLocalStorage } from '../utils';

const PlayerStatsContext = createContext();

export const usePlayerStats = () => useContext(PlayerStatsContext);

export const PlayerStatsProvider = ({ children }) => {
    const [stats, setStats] = useState(() => loadFromLocalStorage('smashAppPlayerStats', {
        points: 0, // スピリッツポイント
    }));

    useEffect(() => {
        saveToLocalStorage('smashAppPlayerStats', stats);
    }, [stats]);

    const addPoints = (amount) => {
        setStats(s => ({ ...s, points: s.points + amount }));
        // 通知はQuizModal側で行うため、ここでは削除
    };
    
    const spendPoints = (amount) => {
        if (stats.points < amount) {
            alert("ポイントが足りません。");
            return false;
        }
        setStats(s => ({...s, points: s.points - amount}));
        return true;
    }

    const value = {
        stats,
        addPoints,
        spendPoints,
    };

    return (
        <PlayerStatsContext.Provider value={value}>
            {children}
        </PlayerStatsContext.Provider>
    );
};