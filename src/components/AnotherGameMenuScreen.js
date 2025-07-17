import React, { useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { Columns, ListOrdered, ChevronLeft } from 'lucide-react';
import { useUI } from '../contexts/UIContext';

const menuItems = [
    { id: 'tier-maker', title: 'Tierランク作成', subtitle: 'キャラクターのランク付けを行う', icon: ListOrdered, color: '#10b981' },
    { id: 'character-comparison', title: 'キャラクター比較', subtitle: '2体のデータを並べて分析', icon: Columns, color: '#0ea5e9' },
];

const MenuItem = ({ item, onClick, onHover, onLeave }) => (
    <motion.div
        className="relative group cursor-pointer text-white flex flex-col items-center justify-center p-4 shadow-xl h-full"
        style={{ backgroundColor: `${item.color}BF`, clipPath: 'polygon(10% 0%, 100% 0%, 90% 100%, 0% 100%)' }}
        whileHover={{ scale: 1.05, zIndex: 10, boxShadow: `0 0 30px ${item.color}` }}
        transition={{ type: 'spring', stiffness: 300 }}
        onClick={onClick} onMouseEnter={onHover} onMouseLeave={onLeave}
    >
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all duration-300" />
        <div className="relative z-10 text-center flex flex-col items-center gap-2">
            <item.icon size={48} className="drop-shadow-md" />
            <h3 className="font-bold text-2xl drop-shadow-md">{item.title}</h3>
            <p className="text-sm opacity-80">{item.subtitle}</p>
        </div>
    </motion.div>
);

const AnotherGameMenuScreen = ({ onNavigate, onBack }) => {
    const { setCursorVariant } = useUI();
    const clickSoundRef = useRef(null);
    const handleMenuClick = useCallback((nextView) => {
        setCursorVariant('default');
        const audio = clickSoundRef.current;
        if (!audio) { onNavigate(nextView); return; }
        const navigateAfterSound = () => { onNavigate(nextView); audio.removeEventListener('ended', navigateAfterSound); };
        audio.addEventListener('ended', navigateAfterSound);
        audio.currentTime = 0;
        audio.play().catch(error => { onNavigate(nextView); });
    }, [onNavigate, setCursorVariant]);

    return (
        <div className="w-screen h-screen bg-emerald-900/50 relative flex flex-col items-center justify-center p-8">
            <audio ref={clickSoundRef} src="/audio/click.mp3" preload="auto"></audio>
            <header className="absolute top-8 left-8">
                <button onClick={onBack} className="flex items-center gap-2 px-4 py-2 rounded-lg text-white hover:bg-white/10">
                    <ChevronLeft size={20} />ホームに戻る
                </button>
            </header>
            <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8" style={{ height: '250px' }}>
                {menuItems.map(item => <MenuItem key={item.id} item={item} onClick={() => handleMenuClick(item.id)} onHover={() => setCursorVariant('hover')} onLeave={() => setCursorVariant('default')} />)}
            </div>
        </div>
    );
};

export default AnotherGameMenuScreen;