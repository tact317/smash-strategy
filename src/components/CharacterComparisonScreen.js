import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, Columns } from 'lucide-react';
import { useData } from '../contexts/DataContext';

const CharacterColumn = ({ selectedCharId, onSelect, otherSelectedId, allChars, charData }) => {
    const char = allChars.find(c => c.id === selectedCharId);
    const data = char ? charData[char.id] : null;

    return (
        <div className="bg-black/20 rounded-lg p-4 flex flex-col gap-4">
            <select value={selectedCharId || ''} onChange={e => onSelect(e.target.value)} className="w-full bg-slate-700 p-3 rounded-md">
                <option value="">キャラクターを選択</option>
                {allChars.map(c => <option key={c.id} value={c.id} disabled={c.id === otherSelectedId}>{c.name}</option>)}
            </select>
            
            {char && data ? (
                <div className="overflow-y-auto custom-scrollbar pr-2 space-y-4">
                    <div className="flex items-center gap-4 p-2 bg-slate-700/50 rounded-md">
                        <div className="w-16 h-16 rounded-md flex-shrink-0" style={{backgroundColor: char.color}}><img src={`/images/${encodeURIComponent(char.icon)}`} alt={char.name} className="w-full h-full object-contain p-1"/></div>
                        <h2 className="text-2xl font-bold">{char.name}</h2>
                    </div>
                    <div>
                        <h3 className="font-bold text-lg mb-2 text-purple-400">立ち回りメモ</h3>
                        <div className="bg-slate-800/50 p-3 rounded-md text-sm space-y-2">
                            <p><strong>序盤:</strong> {data.gameplan?.early || '未入力'}</p>
                            <p><strong>中盤:</strong> {data.gameplan?.mid || '未入力'}</p>
                            <p><strong>撃墜帯:</strong> {data.gameplan?.kill || '未入力'}</p>
                        </div>
                    </div>
                     <div>
                        <h3 className="font-bold text-lg mb-2 text-cyan-400">主要フレーム</h3>
                        <div className="bg-slate-800/50 p-3 rounded-md text-sm space-y-1">
                            {(data.frameData || []).slice(0, 5).map(f => <p key={f.id}>{f.moveName}: <strong>{f.startup}F</strong></p>)}
                            {data.frameData?.length === 0 && <p>未入力</p>}
                        </div>
                    </div>
                </div>
            ) : <div className="flex-grow flex items-center justify-center text-white/50">キャラクターを選択してください</div>}
        </div>
    );
};

const CharacterComparisonScreen = ({ onBack }) => {
    const { characters, characterData } = useData();
    const [char1, setChar1] = useState(characters[0]?.id || null);
    const [char2, setChar2] = useState(characters[1]?.id || null);

    return (
        <div className="w-screen h-screen bg-slate-900 flex flex-col text-white p-4 sm:p-8">
            <header className="flex-shrink-0 mb-6 flex justify-between items-center">
                <h1 className="text-3xl font-bold flex items-center gap-3"><Columns className="text-blue-400"/>キャラクター比較ツール</h1>
                <button onClick={onBack} className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-white/10">
                    <ChevronLeft size={20} />戻る
                </button>
            </header>
            <main className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-8 min-h-0">
                <CharacterColumn selectedCharId={char1} onSelect={setChar1} otherSelectedId={char2} allChars={characters} charData={characterData} />
                <CharacterColumn selectedCharId={char2} onSelect={setChar2} otherSelectedId={char1} allChars={characters} charData={characterData} />
            </main>
        </div>
    );
};

export default CharacterComparisonScreen;