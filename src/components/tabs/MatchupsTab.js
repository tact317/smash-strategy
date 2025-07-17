// src/components/tabs/MatchupsTab.js (全文)

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Edit, X, Save } from 'lucide-react';

const MatchupCard = ({ matchup, onUpdate, onDelete }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editedMatchup, setEditedMatchup] = useState(matchup);

    const handleSave = () => {
        onUpdate(editedMatchup);
        setIsEditing(false);
    };

    const handleCancel = () => {
        setEditedMatchup(matchup);
        setIsEditing(false);
    };

    if (isEditing) {
        return (
            <motion.div layout className="bg-slate-800 p-4 rounded-lg border border-purple-500 space-y-3">
                <input
                    type="text"
                    value={editedMatchup.opponentName}
                    onChange={(e) => setEditedMatchup({ ...editedMatchup, opponentName: e.target.value })}
                    placeholder="相手キャラクター名"
                    className="w-full bg-slate-700 p-2 rounded-md font-bold text-lg"
                />
                <textarea
                    value={editedMatchup.notes}
                    onChange={(e) => setEditedMatchup({ ...editedMatchup, notes: e.target.value })}
                    placeholder="対策メモ..."
                    className="w-full h-24 bg-slate-700 p-2 rounded-md resize-y custom-scrollbar"
                />
                <div className="flex justify-end gap-2">
                    <button onClick={handleCancel} className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded-md flex items-center gap-1"><X size={16}/>キャンセル</button>
                    <button onClick={handleSave} className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded-md flex items-center gap-1"><Save size={16}/>保存</button>
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="bg-black/20 p-4 rounded-lg">
            <div className="flex justify-between items-start">
                <h4 className="text-xl font-bold text-purple-300 mb-2">{matchup.opponentName}</h4>
                <div className="flex gap-2">
                    <button onClick={() => setIsEditing(true)} className="text-white/50 hover:text-white"><Edit size={18} /></button>
                    <button onClick={() => onDelete(matchup.id)} className="text-white/50 hover:text-red-500"><Trash2 size={18} /></button>
                </div>
            </div>
            <p className="text-white/80 whitespace-pre-wrap">{matchup.notes || 'メモがありません'}</p>
        </motion.div>
    );
};


const MatchupsTab = ({ characterData, updateCharacterData }) => {
    const matchups = characterData.matchups || [];

    const handleAddMatchup = () => {
        const newMatchup = {
            id: Date.now(),
            opponentName: '新規キャラ',
            notes: ''
        };
        updateCharacterData(['matchups'], [...matchups, newMatchup]);
    };

    const handleUpdateMatchup = (updatedMatchup) => {
        const newMatchups = matchups.map(m => m.id === updatedMatchup.id ? updatedMatchup : m);
        updateCharacterData(['matchups'], newMatchups);
    };

    const handleDeleteMatchup = (matchupId) => {
        const newMatchups = matchups.filter(m => m.id !== matchupId);
        updateCharacterData(['matchups'], newMatchups);
    };

    return (
        <div>
            <div className="flex justify-end mb-6">
                <button onClick={handleAddMatchup} className="flex items-center gap-2 px-4 py-2 rounded-md bg-white/10 hover:bg-white/20">
                    <Plus size={18} /> キャラ対策を追加
                </button>
            </div>
            <div className="space-y-4">
                <AnimatePresence>
                    {matchups.length > 0 ? (
                        matchups.map(matchup => (
                            <MatchupCard
                                key={matchup.id}
                                matchup={matchup}
                                onUpdate={handleUpdateMatchup}
                                onDelete={handleDeleteMatchup}
                            />
                        ))
                    ) : (
                        <p className="text-center text-white/50 py-8">まだキャラ対策メモはありません。</p>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default MatchupsTab;