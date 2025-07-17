import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, Trophy } from 'lucide-react';
import { useData } from '../../contexts/DataContext';

const RecordsTab = ({ characterData, updateCharacterData, characterId }) => {
    const { characters, addMatchRecord, deleteMatchRecord } = useData();
    const [opponent, setOpponent] = useState(characters[0]?.name || '');

    const records = useMemo(() => {
        const matches = characterData.records?.matches || [];
        const wins = matches.filter(m => m.result === 'win').length;
        const losses = matches.filter(m => m.result === 'loss').length;
        const total = wins + losses;
        const winRate = total > 0 ? ((wins / total) * 100).toFixed(1) : '---';
        return { matches, wins, losses, total, winRate, notes: characterData.records?.notes || '' };
    }, [characterData]);

    const handleAddMatch = (result) => {
        if (!opponent) {
            alert('対戦相手を選択してください。');
            return;
        }
        addMatchRecord(characterId, opponent, result);
    };

    return (
        <div className="space-y-8">
            {/* 新しい戦績入力UI */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-black/20 p-4 rounded-lg flex flex-col sm:flex-row items-center gap-4">
                <div className="flex-grow w-full">
                    <label htmlFor="opponent-select" className="block text-sm font-medium text-white/70 mb-1">対戦相手</label>
                    <select id="opponent-select" value={opponent} onChange={e => setOpponent(e.target.value)} className="w-full bg-slate-700 p-3 rounded-md">
                        {characters.map(char => <option key={char.id} value={char.name}>{char.name}</option>)}
                    </select>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                    <button onClick={() => handleAddMatch('win')} className="w-full h-12 bg-green-600 hover:bg-green-700 rounded-md font-bold">WIN</button>
                    <button onClick={() => handleAddMatch('loss')} className="w-full h-12 bg-red-600 hover:bg-red-700 rounded-md font-bold">LOSE</button>
                </div>
            </motion.div>
            
            {/* 戦績サマリー */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-green-500/10 border border-green-500/30 p-6 rounded-lg text-center"><h3 className="text-lg font-bold text-green-400 mb-2">勝利数</h3><p className="text-5xl font-extrabold">{records.wins}</p></div>
                <div className="bg-red-500/10 border border-red-500/30 p-6 rounded-lg text-center"><h3 className="text-lg font-bold text-red-400 mb-2">敗北数</h3><p className="text-5xl font-extrabold">{records.losses}</p></div>
                <div className="bg-blue-500/10 border border-blue-500/30 p-6 rounded-lg text-center flex flex-col justify-center"><h3 className="text-lg font-bold text-blue-400 mb-2">勝率</h3><p className="text-5xl font-extrabold">{records.winRate}<span className="text-3xl ml-1">%</span></p><p className="text-sm text-white/50 mt-2">{records.total}戦 {records.wins}勝 {records.losses}敗</p></div>
            </div>

            {/* 対戦履歴 */}
            <div>
                <h3 className="text-xl font-bold mb-3">対戦履歴</h3>
                <div className="space-y-2 max-h-96 overflow-y-auto custom-scrollbar pr-2">
                    {records.matches.map(match => (
                        <div key={match.id} className="bg-black/20 p-3 rounded-md flex justify-between items-center">
                            <div>
                                <span className={`font-bold text-lg ${match.result === 'win' ? 'text-green-400' : 'text-red-400'}`}>{match.result.toUpperCase()}</span>
                                <span className="text-white/80 mx-2">vs</span>
                                <span>{match.opponent}</span>
                            </div>
                            <button onClick={() => deleteMatchRecord(characterId, match.id)} className="text-white/30 hover:text-red-500"><Trash2 size={16}/></button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default RecordsTab;