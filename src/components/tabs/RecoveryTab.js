// src/components/tabs/RecoveryTab.js (全文)

import React from 'react';
import { motion } from 'framer-motion';

const RecoverySection = ({ title, value, onChange, color, delay, placeholder }) => (
    <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: delay * 0.1 }}
    >
        <h3 className="text-xl font-bold mb-3" style={{ color }}>
            {title}
        </h3>
        <textarea
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className="w-full h-48 bg-slate-900/50 p-4 rounded-lg border border-white/10 resize-y custom-scrollbar text-white/90 focus:ring-2 focus:outline-none transition"
            style={{'--tw-ring-color': color}}
        />
    </motion.div>
);

const RecoveryTab = ({ characterData, updateCharacterData }) => {
    const { recovery } = characterData;

    const handleRecoveryChange = (field, text) => {
        updateCharacterData(['recovery', field], text);
    };

    const sections = [
        { 
            key: 'patterns', 
            title: '自分の復帰パターン', 
            color: '#60a5fa', // Blue
            placeholder: '上Bの角度、横Bのタイミング、崖掴まりの択、空Nや空前の暴れなど、自分の復帰の選択肢をメモ...'
        },
        { 
            key: 'edgeguarding', 
            title: '相手への復帰阻止パターン', 
            color: '#f87171', // Red
            placeholder: '崖外に出した相手への追撃方法、崖掴まりの2F、その場・回避・ジャンプ上がりの狩り方などをメモ...'
        },
    ];

    return (
        <div className="space-y-8">
            {sections.map((section, index) => (
                <RecoverySection
                    key={section.key}
                    title={section.title}
                    value={recovery[section.key]}
                    onChange={(e) => handleRecoveryChange(section.key, e.target.value)}
                    color={section.color}
                    placeholder={section.placeholder}
                    delay={index}
                />
            ))}
        </div>
    );
};

export default RecoveryTab;