// src/components/TierListIndexScreen.js (全文)

import React from 'react';
import { useData } from '../contexts/DataContext';
import { ChevronLeft, Plus, FileText, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';

const TierListIndexScreen = ({ onNavigate, onBack }) => {
    const { tierLists, setTierLists, setActiveTierListId } = useData();

    const handleSelectTierList = (id) => {
        setActiveTierListId(id);
        onNavigate('tier-maker');
    };

    const handleCreateNew = () => {
        const newId = `custom-${Date.now()}`;
        const newList = {
            id: newId,
            title: '新しいTier表',
            tiers: ['S', 'A', 'B', 'C'],
            characterPlacements: { S: [], A: [], B: [], C: [], unranked: [] }
        };
        setTierLists(prev => [...prev, newList]);
        setActiveTierListId(newId);
        onNavigate('tier-maker');
    };
    
    const handleDeleteTierList = (e, id) => {
        e.stopPropagation(); // 親要素のクリックイベントを防ぐ
        if (tierLists.length <= 1) {
            alert('最後のTier表は削除できません。');
            return;
        }
        if (window.confirm('このTier表を削除しますか？')) {
            setTierLists(prev => prev.filter(list => list.id !== id));
        }
    };

    return (
        <div className="w-screen h-screen bg-slate-900 flex flex-col text-white p-4 sm:p-8">
            <header className="flex-shrink-0 mb-8">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl sm:text-4xl font-bold">Tier表を選択</h1>
                    <button onClick={onBack} className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-white/10">
                        <ChevronLeft size={20} />ホームに戻る
                    </button>
                </div>
            </header>
            <main className="flex-grow grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {tierLists.map(list => (
                    <motion.div
                        key={list.id}
                        onClick={() => handleSelectTierList(list.id)}
                        className="relative group bg-slate-800/50 hover:bg-purple-500/20 border-2 border-slate-700 hover:border-purple-500 rounded-lg flex flex-col items-center justify-center cursor-pointer p-4 transition-all"
                        whileHover={{ y: -5 }}
                    >
                        <FileText className="w-20 h-20 text-white/50 group-hover:text-purple-400 transition-colors" />
                        <h2 className="mt-4 text-xl font-bold text-center">{list.title}</h2>
                        <button 
                            onClick={(e) => handleDeleteTierList(e, list.id)}
                            className="absolute top-2 right-2 p-2 text-white/30 hover:text-red-500 hover:bg-white/10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <Trash2 size={18} />
                        </button>
                    </motion.div>
                ))}
                 <motion.div
                    onClick={handleCreateNew}
                    className="bg-slate-800/20 hover:bg-green-500/20 border-2 border-dashed border-slate-700 hover:border-green-500 rounded-lg flex flex-col items-center justify-center cursor-pointer p-4 transition-all"
                    whileHover={{ y: -5 }}
                >
                    <Plus className="w-20 h-20 text-white/50 group-hover:text-green-400 transition-colors" />
                    <h2 className="mt-4 text-xl font-bold">新しく作る</h2>
                </motion.div>
            </main>
        </div>
    );
};

export default TierListIndexScreen;