// src/components/TacticsNoteScreen.js (全文)

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Zap, Target, Users, Shield, Sword, Clock, Gamepad2, BarChart3, Video, CheckSquare } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { useUI } from '../contexts/UIContext';
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


const TabButton = ({ id, label, icon: Icon, activeTab, setActiveTab, color }) => (
    <button onClick={() => setActiveTab(id)} className="relative px-4 py-3 text-lg font-semibold text-white/70 transition-colors hover:text-white whitespace-nowrap">
      <div className="flex items-center gap-3"><Icon size={20} /><span>{label}</span></div>
      {activeTab === id && (
        <motion.div layoutId="active-tab-indicator" className="absolute bottom-0 left-0 right-0 h-1 rounded-t-full" style={{ background: `linear-gradient(to right, ${color}80, ${color})` }} />
      )}
    </button>
);

const TacticsNoteScreen = ({ character, onBack }) => {
  const { characterData, setCharacterData } = useData();
  const { setCursorVariant } = useUI();
  const [activeTab, setActiveTab] = useState('combos');

  const updateCharacterDataFor = useCallback((path, value) => {
    if (!character?.id) return;
    setCharacterData(prev => {
        const newData = JSON.parse(JSON.stringify(prev));
        let current = newData[character.id];
        if (!current) return prev;
        for (let i = 0; i < path.length - 1; i++) {
            if (current[path[i]] === undefined || current[path[i]] === null) {
                current[path[i]] = {};
            }
            current = current[path[i]];
        }
        current[path[path.length - 1]] = value;
        return newData;
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
            <TabButton id="combos" label="コンボ" icon={Zap} activeTab={activeTab} setActiveTab={setActiveTab} color={character.color} />
            <TabButton id="gameplan" label="立ち回り" icon={Target} activeTab={activeTab} setActiveTab={setActiveTab} color={character.color} />
            <TabButton id="matchups" label="キャラ対策" icon={Users} activeTab={activeTab} setActiveTab={setActiveTab} color={character.color} />
            <TabButton id="recovery" label="復帰・阻止" icon={Shield} activeTab={activeTab} setActiveTab={setActiveTab} color={character.color} />
            <TabButton id="frameData" label="フレーム" icon={Clock} activeTab={activeTab} setActiveTab={setActiveTab} color={character.color} />
            <TabButton id="stageStrategies" label="ステージ" icon={Gamepad2} activeTab={activeTab} setActiveTab={setActiveTab} color={character.color} />
            <TabButton id="records" label="戦績" icon={BarChart3} activeTab={activeTab} setActiveTab={setActiveTab} color={character.color} />
            <TabButton id="videos" label="動画" icon={Video} activeTab={activeTab} setActiveTab={setActiveTab} color={character.color} />
            <TabButton id="practice" label="練習メモ" icon={CheckSquare} activeTab={activeTab} setActiveTab={setActiveTab} color={character.color} />
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