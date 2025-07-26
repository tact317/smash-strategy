// src/components/TacticsNoteScreen.js (全文)

import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Zap, Target, Users, Shield, Sword, Clock, Gamepad2, BarChart3, Video, CheckSquare } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { useUI } from '../contexts/UIContext';
import { useGamepad } from '../contexts/GamepadContext';
import { useFocusable } from '../hooks/useFocusable';
import './TacticsNote.css';

// タブコンポーネントを外部ファイルからインポート
import CombosTab from './tabs/CombosTab';
import GameplanTab from './tabs/GameplanTab';
import MatchupsTab from './tabs/MatchupsTab';
import RecoveryTab from './tabs/RecoveryTab';
import RecordsTab from './tabs/RecordsTab';
import FrameDataTab from './tabs/FrameDataTab';
import StageStrategiesTab from './tabs/StageStrategiesTab';
import VideoLinksTab from './tabs/VideoLinksTab';
import PracticeListTab from './tabs/PracticeListTab';

const tabs = [
    { id: 'combos', label: 'コンボ', icon: Zap },
    { id: 'gameplan', label: '立ち回り', icon: Target },
    { id: 'matchups', label: 'キャラ対策', icon: Users },
    { id: 'recovery', label: '復帰・阻止', icon: Shield },
    { id: 'frameData', label: 'フレーム', icon: Clock },
    { id: 'stageStrategies', label: 'ステージ', icon: Gamepad2 },
    { id: 'records', label: '戦績', icon: BarChart3 },
    { id: 'videos', label: '動画', icon: Video },
    { id: 'practice', label: '練習メモ', icon: CheckSquare },
];

const TabButton = ({ id, label, icon: Icon, activeTab, setActiveTab, color }) => {
    const { focusedId } = useGamepad();
    const ref = useFocusable(id);
    const isFocused = focusedId === id;
    const isActive = activeTab === id;

    return (
        <button
            ref={ref}
            onClick={() => setActiveTab(id)}
            className={`relative px-4 py-3 text-lg font-semibold transition-colors whitespace-nowrap ${isActive ? 'text-white' : 'text-white/70 hover:text-white'} ${isFocused && !isActive ? 'bg-white/10 rounded-t-md' : ''}`}
        >
            <div className="flex items-center gap-3"><Icon size={20} /><span>{label}</span></div>
            {isActive && (
                <motion.div
                    layoutId="active-tab-indicator"
                    className="absolute bottom-0 left-0 right-0 h-1 rounded-t-full"
                    style={{ background: `linear-gradient(to right, ${color}80, ${color})` }}
                />
            )}
        </button>
    );
};

const TacticsNoteScreen = ({ character, onBack }) => {
  const { characterData, setCharacterData } = useData();
  const { setCursorVariant } = useUI();
  const [activeTab, setActiveTab] = useState('combos');
  const { focusedId, focusableElements } = useGamepad();

  // フォーカスされた要素が画面内に表示されるようにスクロールする
  useEffect(() => {
    if (focusedId) {
      const element = focusableElements.get(focusedId);
      if (element) {
        element.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'nearest'
        });
      }
    }
  }, [focusedId, focusableElements]);

  const updateCharacterDataFor = useCallback((path, value) => {
    if (!character?.id) return;

    setCharacterData(prev => {
      const recursiveUpdate = (currentLevel, remainingPath) => {
        const [head, ...tail] = remainingPath;
        const newLevel = { ...(currentLevel || {}) };

        if (tail.length === 0) {
          newLevel[head] = value;
        } else {
          newLevel[head] = recursiveUpdate(newLevel[head], tail);
        }
        return newLevel;
      };

      const updatedCharacterData = recursiveUpdate(prev[character.id], path);

      return {
        ...prev,
        [character.id]: updatedCharacterData,
      };
    });
  }, [character?.id, setCharacterData]);
  
  if (!character || !characterData) return <div className="flex items-center justify-center h-screen text-white">データがありません。</div>;
  
  const currentCharacterData = characterData[character.id];
  if (!currentCharacterData) return <div className="flex items-center justify-center h-screen text-white">キャラクターデータを読み込んでいます...</div>;

  const renderContent = () => {
    const props = { characterData: currentCharacterData, updateCharacterData: updateCharacterDataFor, characterId: character.id };
    switch (activeTab) {
      case 'combos': return <CombosTab {...props} />;
      case 'gameplan': return <GameplanTab {...props} />;
      case 'matchups': return <MatchupsTab {...props} />;
      case 'recovery': return <RecoveryTab {...props} />;
      case 'records': return <RecordsTab {...props} />;
      case 'frameData': return <FrameDataTab {...props} />;
      case 'stageStrategies': return <StageStrategiesTab {...props} />;
      case 'videos': return <VideoLinksTab {...props} />;
      case 'practice': return <PracticeListTab {...props} />;
      default:
        return <div className="text-white/50 text-center p-8 text-2xl">{activeTab} のコンテンツは作成中です。</div>;
    }
  };

  return (
    <div className="w-screen h-screen bg-slate-900 flex flex-col text-white">
      <motion.header 
        className="flex-shrink-0 bg-black/30 backdrop-blur-sm border-b border-white/10"
        initial={{ y: -80 }} animate={{ y: 0 }} transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <div className="container mx-auto px-6 py-3 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-2 rounded-full hover:bg-white/10 overflow-hidden" onMouseEnter={() => setCursorVariant('hover')} onMouseLeave={() => setCursorVariant('default')}><ChevronLeft size={28} /></button>
            <div className="w-16 h-16 rounded-full flex items-center justify-center border-4 border-white/20 overflow-hidden" style={{ backgroundColor: character.color }}>
              {character.icon ? <img src={`/images/${encodeURIComponent(character.icon)}`} alt={character.name} className="w-full h-full object-contain" /> : <Sword size={32} />}
            </div>
            <div>
              <h1 className="text-4xl font-bold">{character.name}</h1>
              <p className="text-white/60">戦術ノート</p>
            </div>
          </div>
        </div>
      </motion.header>

      <nav className="flex-shrink-0 bg-black/20 border-b border-white/10 overflow-x-auto custom-scrollbar">
        <div className="container mx-auto px-6 flex items-center gap-2">
          {tabs.map(tab => (
            <TabButton
              key={tab.id}
              id={tab.id}
              label={tab.label}
              icon={tab.icon}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              color={character.color}
            />
          ))}
        </div>
      </nav>

      <main className="flex-grow p-8 overflow-y-auto custom-scrollbar">
        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};

export default TacticsNoteScreen;