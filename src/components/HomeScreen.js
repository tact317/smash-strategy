import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { Sword, List, Gamepad2, Users, Shield, Settings, Sun, Moon } from 'lucide-react';
import { useUI } from '../contexts/UIContext';
import { useTheme } from '../contexts/ThemeContext';
import { useAudioSettings } from '../contexts/AudioSettingsContext';
import { collectionItems } from '../data/collection';
import { useGamepad } from '../contexts/GamepadContext';
import { useFocusable } from '../hooks/useFocusable';

const menuItems = [
    { id: 'character-select', title: '大乱闘', subtitle: 'キャラクター選択', icon: Sword, image: '/images/menu-bg-1.jpg', color: '#ef4444' },
    { id: 'another-game', title: 'いろんなあそび', subtitle: 'ツール・分析', icon: Users, image: '/images/menu-bg-4.jpg', color: '#f97316' },
    { id: 'spirits', title: 'スピリッツ', subtitle: '目標・課題・分析', icon: Shield, image: '/images/menu-bg-5.jpg', color: '#22c55e' },
    { id: 'collection', title: 'コレクション', subtitle: '戦績・ミッション', icon: List, image: '/images/menu-bg-2.jpg', color: '#3b82f6' },
    { id: 'online', title: 'オンライン', subtitle: 'リプレイ分析', icon: Gamepad2, image: '/images/menu-bg-3.jpg', color: '#eab308' },
    { id: 'settings', title: '設定', subtitle: '各種設定', icon: Settings, image: '/images/menu-bg-default.jpg', color: '#a855f7' },
];
const defaultImage = '/images/menu-bg-default.jpg';
const glowColors = {
    'character-select': 'rgba(220, 38, 38, 0.6)','another-game': 'rgba(249, 115, 22, 0.7)','spirits': 'rgba(34, 197, 94, 0.6)',
    'collection': 'rgba(59, 130, 246, 0.6)','online': 'rgba(234, 179, 8, 0.7)','settings': 'rgba(168, 85, 247, 0.7)'
};

const ThemeToggleButton = ({ theme, toggleTheme }) => {
    const { focusedId } = useGamepad();
    const ref = useFocusable('theme-toggle-button');
    const isFocused = focusedId === 'theme-toggle-button';
    return (
        <div ref={ref} className="absolute bottom-8 right-8 z-50">
            <motion.button
                onClick={toggleTheme}
                className={`w-14 h-14 bg-slate-800/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-all duration-200 shadow-lg border border-white/10 ${isFocused ? 'ring-4 ring-purple-500 scale-110' : ''}`}
                whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
            >
                <AnimatePresence mode="wait">
                    {theme === 'dark' ? ( <motion.div key="dark" initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }}><Sun size={24} /></motion.div> ) 
                    : ( <motion.div key="smash" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }}><Moon size={24} /></motion.div> )}
                </AnimatePresence>
            </motion.button>
        </div>
    );
};

const SmashThemeHome = ({ onNavigate }) => {
    const { setCursorVariant } = useUI();
    const { settings, assignments } = useAudioSettings();
    const { isSeEnabled, seVolume } = settings;
    const hoverSoundRef = useRef(null);

    const playSound = useCallback((audioRef, actionType) => {
        const seId = assignments[actionType];
        if (isSeEnabled && audioRef.current && collectionItems[seId]) {
            audioRef.current.src = collectionItems[seId].source;
            audioRef.current.volume = seVolume;
            audioRef.current.currentTime = 0;
            audioRef.current.play().catch(e => {});
        }
    }, [isSeEnabled, seVolume, assignments]);

    const SmashMenuItem = ({ item }) => {
        const { focusedId } = useGamepad();
        const ref = useFocusable(item.id);
        const isFocused = focusedId === item.id;
        useEffect(() => { 
            if (isFocused) {
                setCursorVariant('hover');
                playSound(hoverSoundRef, 'se_click'); 
            }
        }, [isFocused]);
        
        return (
            <motion.div ref={ref} className={`relative group cursor-pointer text-white flex flex-col items-center justify-center p-4 shadow-xl transition-all duration-200 ${isFocused ? 'ring-4 ring-white ring-inset' : ''}`} style={{ backgroundColor: `${item.color}BF`, clipPath: 'polygon(10% 0%, 100% 0%, 90% 100%, 0% 100%)' }} animate={{ scale: isFocused ? 1.05 : 1, zIndex: isFocused ? 10 : 1 }} onClick={() => onNavigate(item.id)} >
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all duration-300"/>
                <div className="relative z-10 text-center flex flex-col items-center gap-1">
                    <item.icon size={32} className="drop-shadow-md" />
                    <h3 className="font-bold text-xl drop-shadow-md">{item.title}</h3>
                    {item.subtitle && <p className="text-xs opacity-80">{item.subtitle}</p>}
                </div>
            </motion.div>
        );
    };

    const PartyBackground = () => ( <div className="absolute inset-0 overflow-hidden z-0">{[...Array(20)].map((_, i) => ( <motion.div key={i} className="absolute bg-white rounded-full" style={{ width: `${Math.random() * 3 + 1}px`, height: `${Math.random() * 3 + 1}px`, left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%` }} animate={{ x: [0, (Math.random() - 0.5) * 500, 0], y: [0, (Math.random() - 0.5) * 500, 0], scale: [1, Math.random() * 1.5 + 0.5, 1], opacity: [0, Math.random() * 0.3 + 0.1, 0] }} transition={{ duration: Math.random() * 10 + 10, delay: Math.random() * -20, repeat: Infinity, ease: "easeInOut" }} /> ))}</div> );

    return ( <div className="w-full h-full bg-gray-100 relative flex items-center justify-center p-8"> <PartyBackground /> <audio ref={hoverSoundRef} preload="auto"></audio> <div className="w-full h-full grid grid-cols-3 grid-rows-2 gap-6 relative z-10"> {menuItems.map(item => <SmashMenuItem key={item.id} item={item} />)} </div> </div> );
};

const DarkThemeHome = ({ onNavigate }) => {
    const { setCursorVariant } = useUI();
    const { settings, assignments } = useAudioSettings();
    const { isSeEnabled, seVolume } = settings;
    const [hoveredImage, setHoveredImage] = useState(defaultImage);
    const hoverSoundRef = useRef(null);
    
    const playSound = useCallback((audioRef, actionType) => {
        const seId = assignments[actionType];
        if (isSeEnabled && audioRef.current && collectionItems[seId]) {
            audioRef.current.src = collectionItems[seId].source;
            audioRef.current.volume = seVolume;
            audioRef.current.currentTime = 0;
            audioRef.current.play().catch(e => {});
        }
    }, [isSeEnabled, seVolume, assignments]);
    
    const DarkMenuItem = ({ item }) => {
        const { title, subtitle, icon: Icon } = item;
        const { focusedId } = useGamepad();
        const ref = useFocusable(item.id);
        const isFocused = focusedId === item.id;

        useEffect(() => { 
            if(isFocused) {
                setHoveredImage(item.image);
                setCursorVariant('hover');
                playSound(hoverSoundRef, 'se_click');
            }
        }, [isFocused, item.image]);

        return (
            <motion.div ref={ref} className={`bg-slate-800/50 relative cursor-pointer group rounded-lg overflow-hidden backdrop-blur-sm border transition-all duration-200 ${isFocused ? 'border-white/80 ring-4 ring-white/50' : 'border-white/10'}`} animate={{ scale: isFocused ? 1.02 : 1 }} onClick={() => onNavigate(item.id)} >
                <motion.div className="flex flex-col items-center justify-center w-full h-full text-white p-4" style={{'--glow-color': glowColors[item.id] }} whileHover={{ boxShadow: `0 0 40px var(--glow-color)` }} >
                    <div className="absolute top-0 left-[-150%] w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-all duration-700 group-hover:left-[150%] z-0"/>
                    <div className="relative z-10 text-center"> <Icon size={40} className="mb-2 drop-shadow-md"/> <h2 className={`font-extrabold drop-shadow-md text-2xl md:text-3xl`}>{title}</h2> {subtitle && <p className="text-sm md:text-base opacity-80">{subtitle}</p>} </div>
                </motion.div>
            </motion.div>
        );
    };
    return (
        <div className="w-full h-full bg-transparent relative flex items-center justify-center p-4 sm:p-8 md:p-16">
            <audio ref={hoverSoundRef} preload="auto" />
            <motion.div className="grid grid-cols-2 lg:grid-cols-3 grid-rows-3 lg:grid-rows-2 w-full h-full gap-2 md:gap-4" onMouseLeave={() => { setHoveredImage(defaultImage); setCursorVariant('default'); }} >
                {menuItems.map(item => <DarkMenuItem key={item.id} item={item} />)}
            </motion.div>
            <motion.div className="absolute top-1/2 left-1/2 w-[200px] h-[200px] sm:w-[300px] sm:h-[300px] md:w-[350px] md:h-[350px] z-10 pointer-events-none" style={{ x: '-50%', y: '-50%' }} initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.5, ease: 'easeOut', delay: 0.5 }}>
                <div className="relative w-full h-full rounded-full border-4 border-white/80 shadow-2xl bg-slate-900 overflow-hidden">
                    <AnimatePresence> <motion.div key={hoveredImage} className="absolute inset-0 w-full h-full bg-cover bg-center" style={{ backgroundImage: `url(${hoveredImage})` }} initial={{ opacity: 0, scale: 1.1 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.2 }} transition={{ duration: 0.4, ease: 'easeInOut' }} /> </AnimatePresence>
                    <div className="absolute top-0 left-0 w-full h-full rounded-full ring-4 ring-inset ring-white/30"/>
                </div>
            </motion.div>
        </div>
    );
};

const HomeScreen = ({ onNavigate }) => {
    const { theme, toggleTheme } = useTheme();
    const { focusedId } = useGamepad();
    const clickSoundRef = useRef(null);
    const { settings, assignments } = useAudioSettings();
    const { isSeEnabled, seVolume } = settings;

    useEffect(() => {
        const handleGamepadConfirm = (e) => {
            if (e.detail.buttonIndex === 0) { // Aボタン
                const audio = clickSoundRef.current;
                const seId = assignments['se_click'];
                
                const action = () => {
                    if (focusedId === 'theme-toggle-button') {
                        toggleTheme();
                    } else if (focusedId && menuItems.some(item => item.id === focusedId)) {
                        onNavigate(focusedId);
                    }
                };

                if (isSeEnabled && audio && collectionItems[seId]) {
                    audio.src = collectionItems[seId].source;
                    audio.volume = seVolume;
                    audio.currentTime = 0;
                    const playPromise = audio.play();
                    if (playPromise !== undefined) {
                        playPromise.then(_ => {
                            // 音声再生終了後にアクションを実行
                            audio.onended = () => action();
                        }).catch(error => {
                            // 再生が中断された場合などでもアクションを実行
                            action();
                        });
                    }
                } else {
                    action(); // SEが無効なら即時アクション実行
                }
            }
        };

        window.addEventListener('gamepadbuttondown', handleGamepadConfirm);
        return () => window.removeEventListener('gamepadbuttondown', handleGamepadConfirm);
    }, [focusedId, onNavigate, toggleTheme, isSeEnabled, seVolume, assignments]);

    return (
      <div className="w-screen h-screen">
          <audio ref={clickSoundRef} preload="auto"></audio>
          <AnimatePresence mode="wait">
               <motion.div key={theme} className="w-full h-full" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }} >
                  {theme === 'smash' ? 
                      <SmashThemeHome onNavigate={onNavigate} /> : 
                      <DarkThemeHome onNavigate={onNavigate} />}
              </motion.div>
          </AnimatePresence>
          <ThemeToggleButton theme={theme} toggleTheme={toggleTheme} />
      </div>
    );
};

export default HomeScreen;