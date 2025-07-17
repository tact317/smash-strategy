import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, User, BarChart3, Star, Check, X, Award, Loader } from 'lucide-react';
import { db } from '../firebase';
import { getDocs, collection } from "firebase/firestore";
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const FriendProfileScreen = ({ friend, onBack }) => {
    const [friendData, setFriendData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFriendData = async () => {
            if (!friend) return;
            setLoading(true);
            try {
                const charDataCollectionRef = collection(db, "users", friend.id, "characterData");
                const querySnapshot = await getDocs(charDataCollectionRef);
                const charData = {};
                querySnapshot.forEach((doc) => {
                    charData[doc.id] = doc.data();
                });
                setFriendData(charData);
            } catch (error) {
                console.error("フレンドのデータ取得に失敗:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchFriendData();
    }, [friend]);

    const overallStats = useMemo(() => {
        if (!friendData) return { wins: 0, losses: 0, total: 0, winRate: 0 };
        const allMatches = Object.values(friendData).flatMap(data => data.records?.matches || []);
        const wins = allMatches.filter(m => m.result === 'win').length;
        const losses = allMatches.filter(m => m.result === 'loss').length;
        const total = wins + losses;
        const winRate = total > 0 ? ((wins / total) * 100).toFixed(1) : 0;
        return { wins, losses, total, winRate };
    }, [friendData]);
    
    const doughnutData = useMemo(() => ({
        labels: ['勝利', '敗北'],
        datasets: [{
            data: [overallStats.wins, overallStats.losses],
            backgroundColor: ['rgba(34, 197, 94, 0.8)', 'rgba(239, 68, 68, 0.8)'],
            borderColor: ['#1f2937', '#1f2937'],
            borderWidth: 4,
        }],
    }), [overallStats]);
    
    const doughnutOptions = {
        responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, cutout: '70%',
    };

    return (
        <div className="w-screen h-screen bg-slate-800 flex flex-col text-white p-4 sm:p-8">
            <header className="flex-shrink-0 mb-8 flex justify-between items-center">
                <h1 className="text-3xl font-bold flex items-center gap-3"><User />フレンドのプロフィール</h1>
                <button onClick={onBack} className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-white/10">
                    <ChevronLeft size={20} />戻る
                </button>
            </header>
            <main className="flex-grow flex items-center justify-center">
                {loading ? (
                    <Loader className="animate-spin w-12 h-12" />
                ) : friendData ? (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-black/20 p-8 rounded-2xl w-full max-w-2xl">
                        <div className="text-center mb-6">
                            <h2 className="text-lg text-white/70">PLAYER</h2>
                            <p className="text-4xl font-semibold mt-1">{friend.email}</p>
                        </div>
                        <div className="bg-slate-800/50 p-6 rounded-xl">
                            <h2 className="text-xl font-bold mb-4 flex items-center justify-center gap-2"><BarChart3 size={22}/>総合戦績</h2>
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                                <div className="w-40 h-40 relative flex-shrink-0">
                                    <Doughnut data={doughnutData} options={doughnutOptions} />
                                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                        <div className="text-3xl font-bold">{overallStats.winRate}%</div>
                                        <div className="text-sm text-white/60">勝率</div>
                                    </div>
                                </div>
                                <div className="space-y-2 text-sm">
                                    <div className="flex items-center gap-2"><Star size={16} className="text-yellow-400" /><span>総試合数: <strong>{overallStats.total}</strong></span></div>
                                    <div className="flex items-center gap-2"><Check size={16} className="text-green-400" /><span>勝利数: <strong>{overallStats.wins}</strong></span></div>
                                    <div className="flex items-center gap-2"><X size={16} className="text-red-400" /><span>敗北数: <strong>{overallStats.losses}</strong></span></div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ) : <p>フレンドのデータを取得できませんでした。</p>}
            </main>
        </div>
    );
};

export default FriendProfileScreen;