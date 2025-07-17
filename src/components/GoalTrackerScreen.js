import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Plus, Trash2, Trophy, PieChart, BarChartHorizontal } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { Bar, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const GoalTrackerScreen = ({ onBack }) => {
    const { goals, addGoal, toggleGoalStatus, deleteGoal, characters, characterData } = useData();
    const [newGoalText, setNewGoalText] = useState('');

    const handleAddGoal = (e) => {
        e.preventDefault();
        if (!newGoalText.trim()) return;
        addGoal(newGoalText);
        setNewGoalText('');
    };

    // --- レポート用データの計算 ---
    const reportData = useMemo(() => {
        const allRecords = Object.values(characterData).map(d => d.records || { wins: 0, losses: 0 });
        const totalWins = allRecords.reduce((sum, r) => sum + r.wins, 0);
        const totalLosses = allRecords.reduce((sum, r) => sum + r.losses, 0);
        const totalMatches = totalWins + totalLosses;
        const overallWinRate = totalMatches > 0 ? ((totalWins / totalMatches) * 100).toFixed(1) : 0;

        const characterStats = characters.map(char => {
            const records = characterData[char.id]?.records || { wins: 0, losses: 0 };
            const matches = records.wins + records.losses;
            return {
                name: char.name,
                color: char.color,
                matches: matches,
            };
        }).sort((a, b) => b.matches - a.matches).slice(0, 5); // 上位5キャラに絞る

        return {
            totalWins,
            totalLosses,
            totalMatches,
            overallWinRate,
            characterStats,
        };
    }, [characters, characterData]);

    const doughnutData = {
        labels: ['勝利', '敗北'],
        datasets: [{
            data: [reportData.totalWins, reportData.totalLosses],
            backgroundColor: ['rgba(34, 197, 94, 0.7)', 'rgba(239, 68, 68, 0.7)'],
            borderColor: ['#22c55e', '#ef4444'],
            borderWidth: 1,
        }],
    };
    
    const barData = {
        labels: reportData.characterStats.map(c => c.name),
        datasets: [{
            label: '試合数',
            data: reportData.characterStats.map(c => c.matches),
            backgroundColor: reportData.characterStats.map(c => `${c.color}BF`),
            borderColor: reportData.characterStats.map(c => c.color),
            borderWidth: 1,
        }],
    };

    return (
        <div className="w-screen h-screen bg-slate-900 flex flex-col text-white p-4 sm:p-8">
            <header className="flex-shrink-0 mb-6 flex justify-between items-center">
                <h1 className="text-3xl font-bold">目標達成＆成長レポート</h1>
                <button onClick={onBack} className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-white/10">
                    <ChevronLeft size={20} />戻る
                </button>
            </header>

            <div className="flex-grow grid grid-cols-1 lg:grid-cols-2 gap-8 min-h-0">
                {/* 左側: レポートセクション */}
                <div className="flex flex-col gap-6">
                    <h2 className="text-2xl font-semibold flex items-center gap-2"><Trophy size={24} className="text-yellow-400"/>サマリー＆レポート</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-black/20 p-4 rounded-lg flex flex-col items-center justify-center">
                            <h3 className="text-lg text-white/70">総試合数</h3>
                            <p className="text-4xl font-bold">{reportData.totalMatches}</p>
                        </div>
                        <div className="bg-black/20 p-4 rounded-lg flex flex-col items-center justify-center">
                            <h3 className="text-lg text-white/70">総合勝率</h3>
                            <p className="text-4xl font-bold text-cyan-400">{reportData.overallWinRate}%</p>
                        </div>
                    </div>
                    <div className="bg-black/20 p-4 rounded-lg flex-grow flex flex-col">
                        <h3 className="text-lg font-semibold mb-2 flex items-center gap-2"><PieChart size={20} className="text-green-400"/>総合勝敗</h3>
                        <div className="relative flex-grow h-48">
                           {reportData.totalMatches > 0 ? <Doughnut data={doughnutData} options={{ maintainAspectRatio: false, plugins: { legend: { position: 'top' } } }} /> : <div className="flex items-center justify-center h-full text-white/50">戦績データがありません</div>}
                        </div>
                    </div>
                     <div className="bg-black/20 p-4 rounded-lg flex-grow flex flex-col">
                        <h3 className="text-lg font-semibold mb-2 flex items-center gap-2"><BarChartHorizontal size={20} className="text-orange-400"/>使用キャラTop5</h3>
                        <div className="relative flex-grow h-48">
                           {reportData.totalMatches > 0 ? <Bar data={barData} options={{ indexAxis: 'y', maintainAspectRatio: false, plugins: { legend: { display: false } } }} /> : <div className="flex items-center justify-center h-full text-white/50">戦績データがありません</div>}
                        </div>
                    </div>
                </div>

                {/* 右側: 目標リストセクション */}
                <div className="flex flex-col min-h-0">
                    <h2 className="text-2xl font-semibold mb-6">目標リスト</h2>
                    <form onSubmit={handleAddGoal} className="flex gap-4 mb-4 flex-shrink-0">
                        <input
                            type="text" value={newGoalText} onChange={(e) => setNewGoalText(e.target.value)}
                            placeholder="新しい目標 (例: 空後のコンボを覚える)"
                            className="flex-grow bg-slate-700 p-3 rounded-md border border-slate-600 focus:ring-2 focus:ring-green-500 focus:outline-none"
                        />
                        <button type="submit" className="px-6 py-2 bg-green-600 rounded-md hover:bg-green-700 flex items-center justify-center gap-2 font-semibold">
                            <Plus size={18} />追加
                        </button>
                    </form>
                    <div className="flex-grow overflow-y-auto custom-scrollbar pr-2">
                        <div className="space-y-3">
                            <AnimatePresence>
                                {goals.map((goal) => (
                                    <motion.div
                                        key={goal.id} layout initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20 }}
                                        className={`flex items-center gap-4 p-4 rounded-md transition-colors ${goal.completed ? 'bg-green-500/10' : 'bg-black/20'}`}
                                    >
                                        <input type="checkbox" checked={goal.completed} onChange={() => toggleGoalStatus(goal.id)} className="w-6 h-6 accent-green-500 flex-shrink-0 cursor-pointer"/>
                                        <p className={`flex-grow ${goal.completed ? 'line-through text-white/50' : ''}`}>{goal.text}</p>
                                        <button onClick={() => deleteGoal(goal.id)} className="text-red-400 hover:text-red-300 p-1 flex-shrink-0"><Trash2 size={18} /></button>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GoalTrackerScreen;