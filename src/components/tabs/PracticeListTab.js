// src/components/tabs/PracticeListTab.js (全文)

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2 } from 'lucide-react';

const PracticeListTab = ({ characterData, updateCharacterData }) => {
    const practiceList = characterData.practiceList || [];
    const [newTask, setNewTask] = useState('');

    const handleAddTask = (e) => {
        e.preventDefault();
        if (!newTask.trim()) return;
        const newEntry = { id: Date.now(), task: newTask, completed: false };
        updateCharacterData(['practiceList'], [...practiceList, newEntry]);
        setNewTask('');
    };
    
    const handleToggleTask = (id) => {
        const newList = practiceList.map(item => 
            item.id === id ? { ...item, completed: !item.completed } : item
        );
        updateCharacterData(['practiceList'], newList);
    };

    const handleDeleteTask = (id) => {
        updateCharacterData(['practiceList'], practiceList.filter(item => item.id !== id));
    };

    return (
        <div>
            <form onSubmit={handleAddTask} className="flex gap-4 mb-6">
                <input
                    type="text"
                    value={newTask}
                    onChange={(e) => setNewTask(e.target.value)}
                    placeholder="新しい練習項目 (例: 空後からのコンボ練習)"
                    className="flex-grow bg-slate-700 p-3 rounded-md"
                />
                <button type="submit" className="px-6 py-2 bg-purple-600 rounded-md hover:bg-purple-700 flex items-center justify-center gap-2">
                    <Plus size={18} />追加
                </button>
            </form>

            <div className="space-y-2">
                <AnimatePresence>
                {practiceList.map((item) => (
                    <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className={`flex items-center gap-4 p-3 rounded-md transition-colors ${item.completed ? 'bg-green-500/10' : 'bg-black/20'}`}
                    >
                        <input
                            type="checkbox"
                            checked={item.completed}
                            onChange={() => handleToggleTask(item.id)}
                            className="w-5 h-5 accent-purple-500"
                        />
                        <p className={`flex-grow ${item.completed ? 'line-through text-white/50' : ''}`}>
                            {item.task}
                        </p>
                        <button onClick={() => handleDeleteTask(item.id)} className="text-red-400 hover:text-red-300 p-1">
                            <Trash2 size={18} />
                        </button>
                    </motion.div>
                ))}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default PracticeListTab;