import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, CheckCircle2, Lock, Gift, Music, Image as ImageIcon, MousePointerClick } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { missions } from '../data/missions'; // ★★★ 不足していたimport文を追加 ★★★
import { collectionItems } from '../data/collection';
import { usePlayerStats } from '../contexts/PlayerStatsContext';

const MissionsScreen = ({ onBack }) => {
    const [activeTab, setActiveTab] = useState('missions');
    const { missionProgress, unlockedItems } = useData();
    const { stats } = usePlayerStats();

    const collectionByType = useMemo(() => {
        const grouped = { bgm: [], image: [], se: [] };
        for (const item of Object.values(collectionItems)) {
            if (grouped[item.type]) {
                grouped[item.type].push({ ...item, isUnlocked: unlockedItems.includes(item.id) });
            }
        }
        return grouped;
    }, [unlockedItems]);

    return (
        <div className="w-screen h-screen bg-slate-900 flex flex-col text-white p-4 sm:p-8">
            <header className="flex-shrink-0 mb-6 flex justify-between items-center">
                <h1 className="text-3xl font-bold">ミッション & コレクション</h1>
                <div className="flex items-center gap-4">
                    <div className="bg-purple-500/20 text-purple-300 font-bold px-4 py-2 rounded-lg">
                        SP: {stats.points.toLocaleString()}
                    </div>
                    <button onClick={onBack} className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-white/10">
                        <ChevronLeft size={20} />ホームに戻る
                    </button>
                </div>
            </header>
            <div className="flex-shrink-0 border-b border-white/10 mb-6">
                <button onClick={() => setActiveTab('missions')} className={`px-6 py-3 font-semibold relative ${activeTab === 'missions' ? 'text-purple-400' : 'text-white/70'}`}>
                    ミッション
                    {activeTab === 'missions' && <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-1 bg-purple-400"/>}
                </button>
                <button onClick={() => setActiveTab('collection')} className={`px-6 py-3 font-semibold relative ${activeTab === 'collection' ? 'text-purple-400' : 'text-white/70'}`}>
                    コレクション
                    {activeTab === 'collection' && <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-1 bg-purple-400"/>}
                </button>
            </div>
            <main className="flex-grow overflow-y-auto custom-scrollbar pr-2">
                {activeTab === 'missions' && (
                    <div className="space-y-4">
                        {Object.entries(missions).map(([id, mission]) => {
                            const progress = missionProgress[id] || { current: 0, completed: false };
                            const isCompleted = progress.completed;
                            return (
                                <motion.div key={id} className={`bg-black/20 p-4 rounded-lg border-l-4 ${isCompleted ? 'border-yellow-400' : 'border-slate-600'}`} initial={{opacity:0, y:10}} animate={{opacity:1, y:0}}>
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <h3 className={`font-bold text-lg ${isCompleted ? 'text-yellow-400' : 'text-white'}`}>{mission.title}</h3>
                                            <p className="text-sm text-white/60">{mission.description}</p>
                                        </div>
                                        {isCompleted ? <CheckCircle2 className="text-yellow-400"/> : <p className="font-mono text-lg">{Math.min(progress.current, mission.goal)} / {mission.goal}</p>}
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-purple-400 mt-2">
                                        <Gift size={16}/><span>報酬: {collectionItems[mission.reward.id].name}</span>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
                {activeTab === 'collection' && (
                    <div className="space-y-6">
                        <CollectionCategory title="BGM" icon={Music} items={collectionByType.bgm} />
                        <CollectionCategory title="背景画像" icon={ImageIcon} items={collectionByType.image} />
                        <CollectionCategory title="効果音" icon={MousePointerClick} items={collectionByType.se} />
                    </div>
                )}
            </main>
        </div>
    );
};

const CollectionCategory = ({ title, icon: Icon, items }) => (
    <section>
        <h2 className="text-2xl font-semibold mb-3 flex items-center gap-2 border-b border-white/10 pb-2"><Icon/>{title}</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {items.map(item => (
                <div key={item.id} className={`p-4 rounded-lg flex items-center gap-3 ${item.isUnlocked ? 'bg-white/10' : 'bg-black/30'}`}>
                    {item.isUnlocked ? <CheckCircle2 className="text-green-400 flex-shrink-0"/> : <Lock className="text-white/30 flex-shrink-0"/>}
                    <span className={!item.isUnlocked ? 'text-white/30' : ''}>{item.name}</span>
                </div>
            ))}
        </div>
    </section>
);

export default MissionsScreen;