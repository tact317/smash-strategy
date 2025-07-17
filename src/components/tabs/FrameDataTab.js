// src/components/tabs/FrameDataTab.js (全文)

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2 } from 'lucide-react';

const FrameDataTab = ({ characterData, updateCharacterData }) => {
    const frameData = characterData.frameData || [];
    const [newRow, setNewRow] = useState({ moveName: '', startup: '', onShield: '', notes: '' });

    const handleAddRow = () => {
        if (!newRow.moveName.trim()) {
            alert('技名を入力してください。');
            return;
        }
        const newEntry = { ...newRow, id: Date.now() };
        updateCharacterData(['frameData'], [...frameData, newEntry]);
        setNewRow({ moveName: '', startup: '', onShield: '', notes: '' });
    };
    
    const handleDeleteRow = (id) => {
        updateCharacterData(['frameData'], frameData.filter(row => row.id !== id));
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewRow(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div>
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-white/10">
                            <th className="p-3">技名</th>
                            <th className="p-3">発生F</th>
                            <th className="p-3">ガード硬直差</th>
                            <th className="p-3">メモ</th>
                            <th className="p-3 w-12"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {frameData.map((row, index) => (
                            <motion.tr 
                                key={row.id} 
                                className="border-b border-white/10"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <td className="p-3 font-semibold">{row.moveName}</td>
                                <td className="p-3">{row.startup}</td>
                                <td className="p-3">{row.onShield}</td>
                                <td className="p-3 text-white/80">{row.notes}</td>
                                <td className="p-3 text-center">
                                    <button onClick={() => handleDeleteRow(row.id)} className="text-red-400 hover:text-red-300"><Trash2 size={18} /></button>
                                </td>
                            </motion.tr>
                        ))}
                        {/* New Row Input */}
                        <tr className="bg-white/5">
                            <td className="p-2"><input type="text" name="moveName" value={newRow.moveName} onChange={handleInputChange} placeholder="技名" className="w-full bg-slate-700 p-2 rounded-md"/></td>
                            <td className="p-2"><input type="text" name="startup" value={newRow.startup} onChange={handleInputChange} placeholder="発生" className="w-full bg-slate-700 p-2 rounded-md"/></td>
                            <td className="p-2"><input type="text" name="onShield" value={newRow.onShield} onChange={handleInputChange} placeholder="硬直差" className="w-full bg-slate-700 p-2 rounded-md"/></td>
                            <td className="p-2"><input type="text" name="notes" value={newRow.notes} onChange={handleInputChange} placeholder="メモ" className="w-full bg-slate-700 p-2 rounded-md"/></td>
                            <td className="p-2 text-center">
                                <button onClick={handleAddRow} className="p-2 bg-purple-600 rounded-md hover:bg-purple-700"><Plus size={20}/></button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default FrameDataTab;