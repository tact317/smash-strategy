// src/components/CommandManager.js

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Plus} from 'lucide-react';

const CommandManager = ({ commands, onAdd, onDelete, categories }) => {
  const [name, setName] = useState('');
  const [command, setCommand] = useState('');
  const [category, setCategory] = useState(categories[0]);

  const handleAdd = () => {
    if (name.trim() && command.trim()) {
      onAdd({ name, command, category });
      setName('');
      setCommand('');
    }
  };
  
  return (
    <div className="bg-white/5 p-6 rounded-lg h-full flex flex-col">
      <h3 className="text-xl font-semibold mb-4 text-white">コマンドリスト管理</h3>
      <div className="bg-black/20 p-4 rounded-md mb-6 space-y-3">
        <h4 className="font-bold text-white/80">新しいコマンドを追加</h4>
        <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="技名 (例: 横必殺技)" className="w-full bg-slate-900/50 p-2 rounded-md border border-white/10"/>
        <input type="text" value={command} onChange={e => setCommand(e.target.value)} placeholder="コマンド (例: → + B)" className="w-full bg-slate-900/50 p-2 rounded-md border border-white/10"/>
        <select value={category} onChange={e => setCategory(e.target.value)} className="w-full bg-slate-900/50 p-2 rounded-md border border-white/10">
            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
        </select>
        <button onClick={handleAdd} className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md font-semibold flex items-center gap-2"><Plus size={18}/>追加</button>
      </div>

      <div className="space-y-2 flex-grow overflow-y-auto pr-2 custom-scrollbar">
        {commands.map(cmd => (
            <motion.div 
              key={cmd.id} 
              layout
              initial={{opacity: 0, y: -10}}
              animate={{opacity: 1, y: 0}}
              exit={{opacity: 0, x: -20}}
              className="bg-black/20 p-3 rounded-md flex justify-between items-center"
            >
                <div>
                    <p className="font-semibold text-white">{cmd.name} <span className="text-xs text-white/50">({cmd.category})</span></p>
                    <p className="text-sm text-white/60 font-mono">{cmd.command}</p>
                </div>
                <button onClick={() => onDelete(cmd.id)} className="text-red-400 hover:text-red-500 p-2 rounded-full hover:bg-white/10"><X size={18}/></button>
            </motion.div>
        ))}
      </div>
    </div>
  );
};

export default CommandManager;
