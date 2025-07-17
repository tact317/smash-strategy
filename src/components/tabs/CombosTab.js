// src/components/tabs/CombosTab.js (全文)

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Trash2 } from 'lucide-react';
import { useData } from '../../contexts/DataContext';

const CombosTab = ({ characterData, updateCharacterData }) => {
    const { commands } = useData();
    const [commandSelector, setCommandSelector] = useState(null); // { comboId, percentRange }

    const addCombo = (percentRange) => {
        const currentCombos = characterData.combos[percentRange];
        const newCombo = { id: Date.now(), comboSequence: [], damage: '', notes: '', isKillCombo: false };
        updateCharacterData(['combos', percentRange], [...currentCombos, newCombo]);
    };

    const updateComboField = (percentRange, comboId, field, value) => {
        const newCombos = characterData.combos[percentRange].map(c => 
            c.id === comboId ? { ...c, [field]: value } : c
        );
        updateCharacterData(['combos', percentRange], newCombos);
    };

    const deleteCombo = (percentRange, comboId) => {
        const newCombos = characterData.combos[percentRange].filter(c => c.id !== comboId);
        updateCharacterData(['combos', percentRange], newCombos);
    };

    const addCommandToCombo = (command) => {
        if (!commandSelector) return;
        const { comboId, percentRange } = commandSelector;
        const comboToUpdate = characterData.combos[percentRange].find(c => c.id === comboId);
        if (comboToUpdate) {
            const newSequence = [...comboToUpdate.comboSequence, command];
            updateComboField(percentRange, comboId, 'comboSequence', newSequence);
        }
    };
    
    const clearComboSequence = (percentRange, comboId) => {
        updateComboField(percentRange, comboId, 'comboSequence', []);
    };


    const commandCategories = ['地上技', 'スマッシュ攻撃', '必殺技', '空中技', 'つかみ', 'その他'];

    return (
        <div className="space-y-8">
            {[
              { key: 'low', label: '低パーセント (0-40%)' },
              { key: 'mid', label: '中パーセント (40-80%)' },
              { key: 'high', label: '高パーセント (80%+)' },
            ].map((range, index) => (
              <motion.div 
                key={range.key} 
                className="bg-white/5 p-6 rounded-lg border border-white/10"
                initial={{opacity: 0, y: 20}} animate={{opacity: 1, y: 0}} transition={{delay: 0.1 * index}}
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-purple-300">{range.label}</h3>
                  <button onClick={() => addCombo(range.key)} className="flex items-center gap-2 px-4 py-2 rounded-md bg-white/10 hover:bg-white/20"><Plus size={18} /> コンボ追加</button>
                </div>
                <div className="space-y-4">
                  <AnimatePresence>
                  {characterData.combos[range.key].map((combo) => (
                    <motion.div 
                        key={combo.id} 
                        layout
                        initial={{opacity: 0, height: 0}} animate={{opacity: 1, height: 'auto'}} exit={{opacity: 0, height: 0}}
                        className="bg-black/20 p-4 rounded-md border border-white/10"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                        <div className="relative">
                            <label className="text-sm text-white/50">コンボルート</label>
                            <div className="w-full bg-slate-900/50 p-2 rounded-md border border-white/10 min-h-[40px] flex flex-wrap gap-1 items-center">
                                {combo.comboSequence.map((cmd, i) => (
                                    <span key={i} className="bg-slate-700 px-2 py-1 rounded text-sm">{cmd.name}{i < combo.comboSequence.length - 1 ? ' →' : ''}</span>
                                ))}
                                <button onClick={() => setCommandSelector({comboId: combo.id, percentRange: range.key})} className="bg-purple-600 w-6 h-6 rounded flex items-center justify-center hover:bg-purple-700">+</button>
                                {combo.comboSequence.length > 0 && <button onClick={() => clearComboSequence(range.key, combo.id)} className="bg-red-600 w-6 h-6 rounded flex items-center justify-center hover:bg-red-700"><X size={14}/></button>}
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                           <div>
                               <label className="text-sm text-white/50">ダメージ</label>
                               <input type="text" value={combo.damage} onChange={e => updateComboField(range.key, combo.id, 'damage', e.target.value)} placeholder="例: 35%" className="w-full bg-slate-900/50 p-2 rounded-md border border-white/10" />
                           </div>
                           <div className="flex flex-col justify-end">
                                <label className="flex items-center gap-3 text-red-400 font-semibold cursor-pointer mb-2">
                                   <input type="checkbox" checked={combo.isKillCombo} onChange={e => updateComboField(range.key, combo.id, 'isKillCombo', e.target.checked)} className="kill-combo-toggle-checkbox" id={`kill-${combo.id}`} />
                                   <label htmlFor={`kill-${combo.id}`} className="kill-combo-toggle-label"></label>
                                  <span>撃墜コンボ</span>
                                </label>
                           </div>
                        </div>
                      </div>
                      <textarea value={combo.notes} onChange={e => updateComboField(range.key, combo.id, 'notes', e.target.value)} placeholder="メモ (例: 確定帯、回避の読み合いなど)" className="w-full h-20 bg-slate-900/50 p-2 rounded-md border border-white/10 resize-none text-sm"></textarea>
                      <div className="flex justify-end mt-2">
                        <button onClick={() => deleteCombo(range.key, combo.id)} className="text-white/30 hover:text-red-500 p-1"><Trash2 size={18} /></button>
                      </div>
                    </motion.div>
                  ))}
                  </AnimatePresence>
                </div>
              </motion.div>
            ))}

            <AnimatePresence>
            {commandSelector && (
                 <motion.div 
                    className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                    initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
                >
                    <motion.div 
                        className="bg-slate-800 rounded-xl p-6 w-full max-w-2xl max-h-[80vh] flex flex-col border border-purple-500/30"
                        initial={{y: -50, opacity: 0}} animate={{y: 0, opacity: 1}}
                    >
                      <div className="flex justify-between items-center mb-4 flex-shrink-0">
                        <h4 className="text-xl font-bold text-white">コマンドを選択</h4>
                        <button onClick={() => setCommandSelector(null)} className="text-gray-400 hover:text-white p-1"><X size={24} /></button>
                      </div>
                      <div className="overflow-y-auto custom-scrollbar pr-2 space-y-4">
                        {commandCategories.map(cat => {
                           const catCommands = commands.filter(cmd => cmd.category === cat);
                           if (catCommands.length === 0) return null;
                           return (
                               <div key={cat}>
                                   <h5 className="font-bold text-purple-300 mb-2">{cat}</h5>
                                   <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                                      {catCommands.map(cmd => (
                                          <button key={cmd.id} onClick={() => { addCommandToCombo(cmd); setCommandSelector(null); }} className="bg-slate-700 hover:bg-slate-600 text-white py-2 px-3 rounded-lg text-sm text-left transition-colors">
                                            {cmd.name}
                                          </button>
                                      ))}
                                   </div>
                               </div>
                           )
                        })}
                      </div>
                    </motion.div>
                 </motion.div>
            )}
            </AnimatePresence>
        </div>
    );
};

export default CombosTab;