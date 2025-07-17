// src/components/tabs/GameplanTab.js (全文)

import React from 'react';
import { motion } from 'framer-motion';

// 各セクションをコンポーネントとして定義
const GameplanSection = ({ title, value, onChange, color, delay }) => (
    <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: delay * 0.1 }}
    >
        <h3 className="text-xl font-bold mb-3 flex items-center" style={{ color }}>
            {title}
        </h3>
        <textarea
            value={value}
            onChange={onChange}
            placeholder={`${title}の戦術や意識することをメモ...`}
            className="w-full h-36 bg-slate-900/50 p-4 rounded-lg border border-white/10 resize-y custom-scrollbar text-white/90 focus:ring-2 focus:outline-none transition"
            style={{'--tw-ring-color': color}}
        />
    </motion.div>
);

const GameplanTab = ({ characterData, updateCharacterData }) => {
    const { gameplan } = characterData;

    // データ更新用のハンドラ
    const handleGameplanChange = (field, text) => {
        // TacticsNoteScreenから渡された関数を使って、データを更新
        updateCharacterData(['gameplan', field], text);
    };

    const sections = [
        { key: 'early', title: '序盤の立ち回り (0%〜)', color: '#34d399' }, // Green
        { key: 'mid', title: '中盤の立ち回り (ダメージ稼ぎ)', color: '#facc15' }, // Yellow
        { key: 'kill', title: '撃墜帯の立ち回り (バースト方法)', color: '#f87171' }  // Red
    ];

    return (
        <div className="space-y-8">
            {sections.map((section, index) => (
                <GameplanSection
                    key={section.key}
                    title={section.title}
                    value={gameplan[section.key]}
                    onChange={(e) => handleGameplanChange(section.key, e.target.value)}
                    color={section.color}
                    delay={index}
                />
            ))}
        </div>
    );
};

export default GameplanTab;