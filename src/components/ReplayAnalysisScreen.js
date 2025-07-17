import React, { useState, useRef } from 'react';
import { ChevronLeft, Plus, Clock } from 'lucide-react';
import YouTube from 'react-youtube';
import { useData } from '../contexts/DataContext';

const ReplayAnalysisScreen = ({ characterId, replay, onBack }) => {
    const { addNoteToReplay } = useData();
    const [noteText, setNoteText] = useState('');
    const playerRef = useRef(null);

    const videoId = replay.videoUrl.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/)?.[1];

    const opts = { height: '100%', width: '100%', playerVars: { autoplay: 0 } };

    const handleAddNote = async () => {
        if (!noteText.trim() || !playerRef.current) return;
        const currentTime = await playerRef.current.internalPlayer.getCurrentTime();
        const newNote = { time: Math.floor(currentTime), text: noteText };
        addNoteToReplay(characterId, replay.id, newNote);
        setNoteText('');
    };
    
    const seekTo = (time) => {
        if(playerRef.current) playerRef.current.internalPlayer.seekTo(time);
    };

    const formatTime = (totalSeconds) => {
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    return (
        <div className="w-screen h-screen bg-slate-900 flex flex-col text-white p-4 sm:p-8">
            <header className="flex-shrink-0 mb-6 flex justify-between items-center">
                <h1 className="text-2xl font-bold truncate">リプレイ分析: {replay.videoUrl}</h1>
                <button onClick={onBack} className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-white/10"> <ChevronLeft size={20} />リプレイ選択に戻る </button>
            </header>
            <main className="flex-grow grid grid-cols-3 gap-8 min-h-0">
                <div className="col-span-2 bg-black rounded-lg overflow-hidden">
                    {videoId ? <YouTube videoId={videoId} opts={opts} className="w-full h-full" ref={playerRef}/> : <div className="w-full h-full flex items-center justify-center text-red-500">有効なYouTube動画IDが見つかりません。</div>}
                </div>
                <div className="col-span-1 bg-black/20 rounded-lg p-4 flex flex-col">
                    <h2 className="text-xl font-semibold mb-4 flex-shrink-0">タイムスタンプメモ</h2>
                    <div className="flex-grow overflow-y-auto custom-scrollbar space-y-2">
                        {replay.notes.sort((a,b) => a.time - b.time).map(note => (
                            <div key={note.id} className="bg-slate-700/50 p-3 rounded-md">
                                <button onClick={() => seekTo(note.time)} className="flex items-center gap-2 text-cyan-400 font-mono font-bold hover:underline">
                                    <Clock size={16}/>{formatTime(note.time)}
                                </button>
                                <p className="text-white/90 mt-1 ml-1 pl-6 border-l-2 border-cyan-400/30">{note.text}</p>
                            </div>
                        ))}
                    </div>
                    <div className="flex-shrink-0 mt-4 space-y-2">
                        <textarea value={noteText} onChange={(e) => setNoteText(e.target.value)} placeholder="メモを入力..." className="w-full h-24 bg-slate-700 p-2 rounded-lg resize-none custom-scrollbar"/>
                        <button onClick={handleAddNote} className="w-full bg-blue-600 hover:bg-blue-700 p-3 rounded-lg font-semibold flex items-center justify-center gap-2"> <Plus size={20} />現在の時間にメモを追加 </button>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ReplayAnalysisScreen;