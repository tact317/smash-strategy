import React, { useState, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Plus, Film, X, Clock, Trash2, Edit, Check } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { useModal } from '../contexts/ModalContext'; // ★ useModalをインポート
import YouTube from 'react-youtube';

const MemoizedYouTubePlayer = React.memo(({ videoId, onReady }) => {
    const opts = useMemo(() => ({
        height: '100%', width: '100%', playerVars: { autoplay: 0, modestbranding: 1 },
    }), []);
    if (!videoId) return <div className="w-full h-full flex items-center justify-center text-red-500">有効なYouTube動画IDが見つかりません。</div>;
    return <YouTube videoId={videoId} opts={opts} className="w-full h-full" onReady={onReady} />;
});

const AddReplayModal = ({ onAdd, onClose, selectedChar }) => {
    const [url, setUrl] = useState('');
    const handleSubmit = (e) => {
        e.preventDefault();
        if (url.trim() && selectedChar) { onAdd(selectedChar.id, url.trim()); onClose(); } 
        else { alert('URLを入力してください。'); }
    };
    return <motion.div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><motion.div className="bg-slate-800 rounded-xl p-6 w-full max-w-lg border border-blue-500/30 shadow-2xl" initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }}><div className="flex justify-between items-center mb-4"><h3 className="text-xl font-bold text-white">新しいリプレイ動画を追加</h3><button onClick={onClose} className="text-gray-400 hover:text-white"><X size={24} /></button></div><form onSubmit={handleSubmit}><input type="text" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="YouTube動画のURLを貼り付け" className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white mb-4" autoFocus /><div className="flex justify-end"><button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md">追加する</button></div></form></motion.div></motion.div>;
};

const CharSelectView = ({ characters, onSelectChar, onBack }) => (
    <>
        <header className="mb-8 flex-shrink-0 flex justify-between items-center">
            <h1 className="text-3xl font-bold">キャラクターを選択</h1>
            <button onClick={onBack} className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-white/10"><ChevronLeft size={20} />メニューに戻る</button>
        </header>
        <div className="flex-grow overflow-y-auto custom-scrollbar pr-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
                {characters.map(char => (
                    <div key={char.id} onClick={() => onSelectChar(char)} className="group cursor-pointer aspect-square">
                        <div className="w-full h-full rounded-lg flex flex-col items-center justify-end text-white font-bold shadow-lg group-hover:shadow-2xl border-2 border-transparent group-hover:border-white/80 transition-all duration-300 transform group-hover:scale-105 p-2 bg-no-repeat bg-cover bg-center" style={{ backgroundImage: `linear-gradient(to top, ${char.color}A0 20%, transparent 70%), url(/images/${encodeURIComponent(char.icon)})` }}>
                            <span className="text-center text-sm shadow-black [text-shadow:_0_1px_2px_var(--tw-shadow-color)]">{char.name}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </>
);

const ReplayListView = ({ selectedChar, replays, onSelectReplay, onAddReplay, onDeleteReplay, onBack }) => {
    const { showConfirm } = useModal();

    const handleDeleteClick = async (replayId) => {
        const confirmed = await showConfirm(
            "リプレイの削除",
            "このリプレイを削除しますか？この操作は取り消せません。"
        );
        if (confirmed) {
            onDeleteReplay(replayId);
        }
    };

    return (
        <>
            <header className="mb-8 flex-shrink-0 flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full flex items-center justify-center border-4 border-white/20 overflow-hidden" style={{ backgroundColor: selectedChar.color }}><img src={`/images/${encodeURIComponent(selectedChar.icon)}`} alt={selectedChar.name} className="w-full h-full object-contain" /></div>
                    <h1 className="text-3xl font-bold">{selectedChar.name} のリプレイリスト</h1>
                </div>
                <button onClick={onBack} className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-white/10"><ChevronLeft size={20} />キャラ選択に戻る</button>
            </header>
            <div className="flex-grow overflow-y-auto custom-scrollbar pr-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {replays.map(replay => (
                        <motion.div key={replay.id} className="group bg-black/20 rounded-lg flex flex-col transition-colors" whileHover={{y: -5}}>
                            <div onClick={() => onSelectReplay(replay)} className="cursor-pointer p-4 flex items-center gap-4 flex-grow"><Film size={32} className="text-blue-400 flex-shrink-0"/><div><p className="font-semibold break-all">{replay.videoUrl}</p><p className="text-sm text-white/50">{replay.notes.length}件のメモ</p></div></div>
                            <button onClick={() => handleDeleteClick(replay.id)} className="text-red-500/50 hover:text-red-500 hover:bg-red-500/10 p-2 rounded-b-lg flex items-center justify-center gap-1 text-xs"><Trash2 size={14}/>削除</button>
                        </motion.div>
                    ))}
                    <motion.div onClick={onAddReplay} className="group cursor-pointer bg-blue-600/20 hover:bg-blue-600/40 border-2 border-dashed border-blue-500 rounded-lg flex items-center justify-center gap-2 text-blue-300 min-h-[100px]" whileHover={{y: -5}}><Plus size={24} /> 新しいリプレイを追加</motion.div>
                </div>
            </div>
        </>
    );
};

const AnalysisView = ({ selectedChar, replay, onBack, dataHandlers }) => {
    const playerRef = useRef(null);
    const [noteText, setNoteText] = useState('');
    const [editingNote, setEditingNote] = useState(null);
    const { showConfirm } = useModal();

    const videoId = useMemo(() => replay.videoUrl.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/)?.[1], [replay.videoUrl]);
    
    const onPlayerReady = (event) => { playerRef.current = event.target; };
    const handleAddNote = async (e) => { e.preventDefault(); if (!noteText.trim() || !playerRef.current) return; const currentTime = await playerRef.current.getCurrentTime(); dataHandlers.addNote({ time: Math.floor(currentTime), text: noteText }); setNoteText(''); };
    const handleUpdateNote = (e) => { e.preventDefault(); if (!editingNote || !editingNote.text.trim()) return; dataHandlers.updateNote(editingNote.id, editingNote.text); setEditingNote(null); };
    
    const handleDeleteNoteClick = async (noteId) => {
        const confirmed = await showConfirm("メモの削除", "このメモを削除しますか？");
        if(confirmed) {
            dataHandlers.deleteNote(noteId);
        }
    };

    const seekTo = (time) => { if(playerRef.current) playerRef.current.seekTo(time); };
    const formatTime = (s) => `${Math.floor(s/60)}:${(s%60).toString().padStart(2,'0')}`;

    return <>
        <header className="flex-shrink-0 mb-6 flex justify-between items-center"><h1 className="text-2xl font-bold truncate">リプレイ分析: {replay.videoUrl}</h1><button onClick={onBack} className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-white/10"><ChevronLeft size={20} />リプレイ一覧に戻る</button></header>
        <main className="flex-grow grid grid-cols-3 gap-8 min-h-0 relative">
            <div className="col-span-2 bg-black rounded-lg overflow-hidden"><MemoizedYouTubePlayer videoId={videoId} onReady={onPlayerReady} /></div>
            <div className="col-span-1 bg-black/20 rounded-lg p-4 flex flex-col z-10">
                <h2 className="text-xl font-semibold mb-4 flex-shrink-0">タイムスタンプメモ</h2>
                <div className="flex-grow overflow-y-auto custom-scrollbar space-y-2 pr-2">
                    {replay.notes.sort((a,b) => a.time - b.time).map(note => (
                        <div key={note.id} className="bg-slate-700/50 p-3 rounded-md group">
                            <div className="flex justify-between items-start"><button onClick={() => seekTo(note.time)} className="flex items-center gap-2 text-cyan-400 font-mono font-bold hover:underline"><Clock size={16}/>{formatTime(note.time)}</button><div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity"><button onClick={() => setEditingNote({id: note.id, text: note.text})} className="p-1 text-white/50 hover:text-yellow-400"><Edit size={14}/></button><button onClick={() => handleDeleteNoteClick(note.id)} className="p-1 text-white/50 hover:text-red-500"><Trash2 size={14}/></button></div></div>
                            {editingNote?.id === note.id ? (
                                <form onSubmit={handleUpdateNote} className="mt-2 flex gap-2"><input type="text" value={editingNote.text} onChange={(e) => setEditingNote({...editingNote, text: e.target.value})} className="flex-grow bg-slate-900 p-1 rounded" autoFocus /><button type="submit" className="p-1 bg-green-600 rounded"><Check size={16}/></button></form>
                            ) : (
                                <p className="text-white/90 mt-1 ml-1 pl-6 border-l-2 border-cyan-400/30">{note.text}</p>
                            )}
                        </div>
                    ))}
                </div>
                <div className="flex-shrink-0 mt-4"><textarea value={noteText} onChange={(e) => setNoteText(e.target.value)} placeholder="メモを入力..." className="w-full h-24 bg-slate-700 p-2 rounded-lg resize-none custom-scrollbar"/><button type="button" onClick={handleAddNote} className="w-full bg-blue-600 hover:bg-blue-700 p-3 rounded-lg font-semibold flex items-center justify-center gap-2 mt-2"><Plus size={20} />現在の時間にメモを追加</button></div>
            </div>
        </main>
    </>;
};

const ReplayFeatureScreen = ({ onBack }) => {
    const { characters, replayNotes, addReplay, deleteReplay, addNoteToReplay, updateNoteInReplay, deleteNoteFromReplay } = useData();
    const [view, setView] = useState('char-select');
    const [selectedChar, setSelectedChar] = useState(null);
    const [selectedReplay, setSelectedReplay] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const dataHandlers = useMemo(() => ({
        addNote: (note) => addNoteToReplay(selectedChar.id, selectedReplay.id, note),
        updateNote: (noteId, newText) => updateNoteInReplay(selectedChar.id, selectedReplay.id, noteId, newText),
        deleteNote: (noteId) => deleteNoteFromReplay(selectedChar.id, selectedReplay.id, noteId),
    }), [selectedChar, selectedReplay, addNoteToReplay, updateNoteInReplay, deleteNoteFromReplay]);

    const handleSelectChar = (char) => { setSelectedChar(char); setView('replay-list'); };
    const handleSelectReplay = (replay) => { setSelectedReplay(replay); setView('analysis'); };
    const handleBack = () => {
        if (view === 'analysis') { setSelectedReplay(null); setView('replay-list'); }
        else if (view === 'replay-list') { setSelectedChar(null); setView('char-select'); }
        else onBack();
    };

    const currentViewComponent = () => {
        switch(view) {
            case 'char-select': return <CharSelectView characters={characters} onSelectChar={handleSelectChar} onBack={onBack} />;
            case 'replay-list': if (!selectedChar) return null; return <ReplayListView selectedChar={selectedChar} replays={replayNotes[selectedChar.id] || []} onSelectReplay={handleSelectReplay} onAddReplay={() => setIsModalOpen(true)} onDeleteReplay={(replayId) => deleteReplay(selectedChar.id, replayId)} onBack={handleBack} />;
            case 'analysis':
                if (!selectedChar || !selectedReplay) return null;
                const currentReplayData = (replayNotes[selectedChar.id] || []).find(r => r.id === selectedReplay.id);
                return currentReplayData ? <AnalysisView selectedChar={selectedChar} replay={currentReplayData} onBack={handleBack} dataHandlers={dataHandlers} /> : <div className="text-center text-red-500">リプレイの読み込みに失敗しました。</div>;
            default: return null;
        }
    };

    return (
        <div className="w-screen h-screen bg-slate-900 text-white p-8 flex flex-col">
            <AnimatePresence mode="wait">
                <motion.div key={view} className="w-full h-full flex flex-col" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} transition={{ duration: 0.3 }}>
                    {currentViewComponent()}
                </motion.div>
            </AnimatePresence>
            <AnimatePresence>
                {isModalOpen && <AddReplayModal onClose={() => setIsModalOpen(false)} onAdd={addReplay} selectedChar={selectedChar} />}
            </AnimatePresence>
        </div>
    );
};

export default ReplayFeatureScreen;