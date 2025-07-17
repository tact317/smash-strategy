import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ShieldAlert } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const NemesisTrackerScreen = ({ onBack }) => {
    const { characters, characterData } = useData();

    const nemesisData = useMemo(() => {
        const opponentStats = {};

        // 全ての対戦履歴から、相手ごとの勝敗をカウント
        Object.values(characterData).forEach(data => {
            (data.records?.matches || []).forEach(match => {
                if (!opponentStats[match.opponent]) {
                    opponentStats[match.opponent] = { wins: 0, losses: 0 };
                }
                if (match.result === 'win') {
                    opponentStats[match.opponent].wins++;
                } else {
                    opponentStats[match.opponent].losses++;
                }
            });
        });

        let worstOpponent = null;
        let lowestWinRate = 101; // 100%より大きい初期値

        // 最低5戦している相手の中から、最も勝率の低い相手を見つける
        const MIN_MATCHES = 5;
        Object.entries(opponentStats).forEach(([opponentName, stats]) => {
            const totalMatches = stats.wins + stats.losses;
            if (totalMatches >= MIN_MATCHES) {
                const winRate = (stats.wins / totalMatches) * 100;
                if (winRate < lowestWinRate) {
                    lowestWinRate = winRate;
                    worstOpponent = {
                        name: opponentName,
                        ...stats,
                        totalMatches,
                        winRate: winRate.toFixed(1),
                    };
                }
            }
        });

        return worstOpponent;
    }, [characterData]);

    const nemesisCharacter = useMemo(() => {
        if (!nemesisData) return null;
        return characters.find(c => c.name === nemesisData.name);
    }, [nemesisData, characters]);

    const doughnutData = useMemo(() => {
        if (!nemesisData) return null;
        return {
            labels: ['勝利', '敗北'],
            datasets: [{
                data: [nemesisData.wins, nemesisData.losses],
                backgroundColor: ['rgba(74, 222, 128, 0.7)', 'rgba(248, 113, 113, 0.7)'],
                borderColor: ['#4ade80', '#f87171'],
                borderWidth: 2,
            }],
        };
    }, [nemesisData]);

    return (
        <div className="w-screen h-screen bg-slate-900 flex flex-col text-white p-4 sm:p-8">
            <header className="flex-shrink-0 mb-8 flex justify-between items-center">
                <h1 className="text-3xl font-bold flex items-center gap-3"><ShieldAlert className="text-red-500"/>ネメシス・トラッカー</h1>
                <button onClick={onBack} className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-white/10">
                    <ChevronLeft size={20} />ホームに戻る
                </button>
            </header>

            <main className="flex-grow flex items-center justify-center">
                {nemesisData ? (
                    <motion.div initial={{opacity:0, scale:0.9}} animate={{opacity:1, scale:1}} className="bg-black/20 p-8 rounded-2xl w-full max-w-lg flex flex-col items-center gap-6">
                        <p className="text-xl text-white/70">あなたの天敵は...</p>
                        <div className="flex items-center gap-4">
                            {nemesisCharacter && (
                                <div className="w-24 h-24 rounded-full flex-shrink-0 overflow-hidden" style={{ backgroundColor: nemesisCharacter.color }}>
                                    <img src={`/images/${encodeURIComponent(nemesisCharacter.icon)}`} alt={nemesisCharacter.name} className="w-full h-full object-contain" />
                                </div>
                            )}
                            <h2 className="text-6xl font-bold">{nemesisData.name}</h2>
                        </div>
                        
                        <div className="w-full max-w-xs h-64">
                            <Doughnut data={doughnutData} options={{ maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }}/>
                        </div>

                        <div className="text-center">
                            <p className="text-lg">対戦成績</p>
                            <p className="text-4xl font-bold">{nemesisData.wins}勝 {nemesisData.losses}敗</p>
                            <p className="text-2xl font-bold text-red-400">勝率: {nemesisData.winRate}%</p>
                            <p className="text-sm text-white/50">({nemesisData.totalMatches}戦以上が対象)</p>
                        </div>
                    </motion.div>
                ) : (
                    <div className="text-center text-white/50">
                        <p className="text-2xl">まだ天敵を特定できるほどのデータがありません。</p>
                        <p className="mt-2">各キャラクターの「戦績」タブから、5戦以上の対戦記録を入力してください。</p>
                    </div>
                )}
            </main>
        </div>
    );
};

export default NemesisTrackerScreen;