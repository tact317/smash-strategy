import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Plus, Film, X } from 'lucide-react';
import { useData } from '../contexts/DataContext';

const AddReplayModal = ({ onClose, onAdd }) => {
    const [url, setUrl] = useState('');
    const handleSubmit = (e) => {
        e.preventDefault();
        const videoId = url.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/)?.[1];
        if (videoId) {
            onAdd(url);
        } else {
            alert('有効なYouTubeのURLを入力してください。');
        }
    };
    return (
        <motion.div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="bg-slate-800 rounded-xl p-6 w-full max-w-lg border border-blue-500/30 shadow-2xl" initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }}>
                <div className="flex justify-between items-center mb-4"><h3 className="text-xl font-bold text-white">新しいリプレイ動画を追加</h3><button onClick={onClose} className="text-gray-400 hover:text-white"><X size={24} /></button></div>
                <form onSubmit={handleSubmit}>
                    <input type="text" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="YouTube動画のURLを貼り付け" className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white mb-4" autoFocus />
                    <div className="flex justify-end"><button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md">追加する</button></div>
                </form>
            </motion.div>
        </motion.div>
    );
};

const ReplaySelectionScreen = ({ onNavigate, onBack }) => {
    const { characters, replayNotes, addReplay } = useData();
    const [selectedChar, setSelectedChar] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleAddReplay = (url) => {
        if (selectedChar) {
            addReplay(selectedChar.id, url);
        }
        setIsModalOpen(false);
    };
    
    const handleSelectReplay = (replay) => {
        if (selectedChar && replay) {
            onNavigate('replay-analysis', { characterId: selectedChar.id, replay: replay });
        } else {
            console.error("キャラクターまたはリプレイが選択されていません。");
        }
    };

    // --- キャラクター選択画面 ---
    if (!selectedChar) {
        return (
            // ★ 修正点: flex と flex-col を追加して、縦方向に要素を並べるレイアウトにする
            <div className="w-screen h-screen bg-slate-900 text-white p-8 flex flex-col">
                <header className="mb-8 flex-shrink-0"> {/* ★ 修正点: ヘッダーが伸縮しないようにする */}
                    <h1 className="text-3xl font-bold">キャラクターを選択</h1>
                </header>

                {/* ★ 修正点: スクロールさせたいエリアを新しいdivで囲む */}
                <div className="flex-grow overflow-y-auto custom-scrollbar pr-4">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
                        {characters.map(char => (
                            <div key={char.id} onClick={() => setSelectedChar(char)} className="group cursor-pointer aspect-square" >
                                <div className="w-full h-full rounded-lg flex flex-col items-center justify-end text-white font-bold shadow-lg group-hover:shadow-2xl border-2 border-transparent group-hover:border-white/80 transition-all duration-300 transform group-hover:scale-105 p-2 bg-no-repeat bg-cover bg-center" style={{ backgroundImage: `linear-gradient(to top, ${char.color}A0 20%, transparent 70%), url(/images/${encodeURIComponent(char.icon)})` }}>
                                    <span className="text-center text-sm shadow-black [text-shadow:_0_1px_2px_var(--tw-shadow-color)]">{char.name}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <button onClick={onBack} className="absolute top-8 right-8 flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-white/10">
                    <ChevronLeft size={20} />メニューに戻る
                </button>
            </div>
        );
    }

    // --- リプレイ選択画面 ---
    const replaysForChar = replayNotes[selectedChar.id] || [];

    return (
        <div className="w-screen h-screen bg-slate-900 text-white p-8">
            <header className="mb-8">
                <div className="flex items-center gap-4">
                     <div className="w-16 h-16 rounded-full flex items-center justify-center border-4 border-white/20 overflow-hidden" style={{ backgroundColor: selectedChar.color }}>
                        <img src={`/images/${encodeURIComponent(selectedChar.icon)}`} alt={selectedChar.name} className="w-full h-full object-contain" />
                    </div>
                    <h1 className="text-3xl font-bold">{selectedChar.name} のリプレイリスト</h1>
                </div>
            </header>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {replaysForChar.map(replay => (
                    <motion.div key={replay.id} onClick={() => handleSelectReplay(replay)} className="group cursor-pointer bg-black/20 hover:bg-black/40 p-4 rounded-lg flex items-center gap-4 transition-colors" whileHover={{y: -5}}>
                        <Film size={32} className="text-blue-400"/>
                        <div>
                            <p className="font-semibold break-all">{replay.videoUrl}</p>
                            <p className="text-sm text-white/50">{replay.notes.length}件のメモ</p>
                        </div>
                    </motion.div>
                ))}
                <motion.div onClick={() => setIsModalOpen(true)} className="group cursor-pointer bg-blue-600/20 hover:bg-blue-600/40 border-2 border-dashed border-blue-500 rounded-lg flex items-center justify-center gap-2 text-blue-300" whileHover={{y: -5}}>
                    <Plus size={24} /> 新しいリプレイを追加
                </motion.div>
            </div>
            <button onClick={() => setSelectedChar(null)} className="absolute top-8 right-8 flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-white/10"><ChevronLeft size={20} />キャラ選択に戻る</button>
            <AnimatePresence>
                {isModalOpen && <AddReplayModal onClose={() => setIsModalOpen(false)} onAdd={handleAddReplay} />}
            </AnimatePresence>
        </div>
    );
};

export default ReplaySelectionScreen;