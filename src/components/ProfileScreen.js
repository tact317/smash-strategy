import React, { useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import { LogOut, User, ChevronLeft, BarChart3, Star, Check, X, Award, Save, CheckCircle2, UserPlus, Users, CheckSquare, XSquare } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { toPng } from 'html-to-image';
import { missions } from '../data/missions';

ChartJS.register(ArcElement, Tooltip, Legend);

const ProfileScreen = ({ onNavigate, onBack }) => {
    const { currentUser, logout, friends, friendRequests, acceptFriendRequest, declineFriendRequest } = useAuth();
    const { characterData, missionProgress } = useData();
    const cardRef = useRef(null);

    const achievements = useMemo(() => {
        return Object.keys(missionProgress)
            .filter(id => missionProgress[id].completed)
            .map(id => missions[id])
            .filter(Boolean);
    }, [missionProgress]);

    const overallStats = useMemo(() => {
        const allMatches = Object.values(characterData).flatMap(data => data.records?.matches || []);
        const wins = allMatches.filter(m => m.result === 'win').length;
        const losses = allMatches.filter(m => m.result === 'loss').length;
        const total = wins + losses;
        const winRate = total > 0 ? ((wins / total) * 100).toFixed(1) : 0;
        return { wins, losses, total, winRate };
    }, [characterData]);

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
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false }
        },
        cutout: '70%',
    };

    const handleLogout = async () => {
        try { await logout(); } catch (error) { alert(`ログアウトに失敗しました: ${error.message}`); }
    };

    const handleSaveAsImage = () => {
        if (cardRef.current) {
            toPng(cardRef.current, { backgroundColor: '#111827' })
                .then((dataUrl) => {
                    const link = document.createElement('a');
                    link.download = `player-card-${currentUser.email.split('@')[0]}.png`;
                    link.href = dataUrl;
                    link.click();
                })
                .catch((err) => console.error('画像の保存に失敗しました', err));
        }
    };

    return (
        <div className="w-screen h-screen bg-slate-900 flex flex-col text-white p-4 sm:p-8">
            <header className="flex-shrink-0 mb-6 flex justify-between items-center">
                <h1 className="text-3xl font-bold flex items-center gap-3"><User />プロフィール</h1>
                <div className="flex items-center gap-2">
                    <button onClick={() => onNavigate('find-friend')} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 font-semibold"><UserPlus size={20} />フレンドを探す</button>
                    <button onClick={handleSaveAsImage} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 font-semibold"><Save size={20} />カードを保存</button>
                    <button onClick={onBack} className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-white/10"><ChevronLeft size={20} />設定に戻る</button>
                </div>
            </header>
            <main className="flex-grow grid lg:grid-cols-3 gap-8 min-h-0">
                <div ref={cardRef} className="lg:col-span-2 bg-black/20 p-8 rounded-2xl w-full border border-white/10">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
                        <div className="md:col-span-2 text-center md:text-left flex flex-col justify-between">
                            <div>
                                <h2 className="text-lg text-white/70">PLAYER</h2>
                                <p className="text-2xl xl:text-3xl font-semibold mt-1 break-all mb-8">{currentUser?.email}</p>
                            </div>
                            <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-red-600 hover:bg-red-700 font-semibold"><LogOut size={20} />ログアウト</button>
                        </div>
                        <div className="md:col-span-3 grid grid-cols-1 gap-8">
                            <div className="bg-slate-800/50 p-6 rounded-xl">
                                 <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><BarChart3 size={22}/>総合戦績</h2>
                                 <div className="flex items-center gap-6">
                                    <div className="w-32 h-32 relative flex-shrink-0">
                                        <Doughnut data={doughnutData} options={doughnutOptions} />
                                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                            <div className="text-3xl font-bold">{overallStats.winRate}%</div>
                                            <div className="text-sm text-white/60">勝率</div>
                                        </div>
                                    </div>
                                    <div className="flex-grow space-y-2 text-sm">
                                        <div className="flex items-center gap-2"><Star size={16} className="text-yellow-400" /><span>総試合数: <strong>{overallStats.total}</strong></span></div>
                                        <div className="flex items-center gap-2"><Check size={16} className="text-green-400" /><span>勝利数: <strong>{overallStats.wins}</strong></span></div>
                                        <div className="flex items-center gap-2"><X size={16} className="text-red-400" /><span>敗北数: <strong>{overallStats.losses}</strong></span></div>
                                    </div>
                                 </div>
                            </div>
                             <div className="bg-slate-800/50 p-6 rounded-xl">
                                <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Award size={22}/>実績</h2>
                                <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-2">
                                    {achievements.length > 0 ? achievements.map(ach => (
                                        <div key={ach.title} className="flex items-center gap-2 text-yellow-400">
                                            <CheckCircle2 size={16} />
                                            <span className="font-semibold">{ach.title}</span>
                                        </div>
                                    )) : <p className="text-white/50 text-sm">まだ実績はありません。</p>}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex flex-col gap-8 min-h-0">
                    <div className="bg-black/20 p-6 rounded-2xl flex flex-col border border-white/10">
                        <h2 className="text-xl font-bold mb-4 flex-shrink-0">届いたフレンド申請</h2>
                        <div className="flex-grow space-y-3 overflow-y-auto custom-scrollbar pr-2">
                            {friendRequests.length > 0 ? friendRequests.map(req => (
                                <div key={req.id} className="bg-slate-700/50 p-3 rounded-md flex justify-between items-center">
                                    <p className="font-semibold break-all">{req.from}</p>
                                    <div className="flex gap-2">
                                        <button onClick={() => acceptFriendRequest(req.id, req.from)} className="p-2 bg-green-600 hover:bg-green-700 rounded-md"><CheckSquare size={18}/></button>
                                        <button onClick={() => declineFriendRequest(req.id)} className="p-2 bg-red-600 hover:bg-red-700 rounded-md"><XSquare size={18}/></button>
                                    </div>
                                </div>
                            )) : <p className="text-sm text-white/50 text-center py-4">新しい申請はありません。</p>}
                        </div>
                    </div>
                    <div className="bg-black/20 p-6 rounded-2xl flex-grow flex flex-col border border-white/10">
                        <h2 className="text-xl font-bold mb-4 flex-shrink-0 flex items-center gap-2"><Users />フレンドリスト</h2>
                        <div className="flex-grow space-y-3 overflow-y-auto custom-scrollbar pr-2">
                            {friends.length > 0 ? friends.map(friend => (
                                <motion.div 
                                    key={friend.id} 
                                    onClick={() => onNavigate('friend-profile', { friend })}
                                    className="bg-slate-700/50 p-3 rounded-md flex justify-between items-center cursor-pointer hover:bg-slate-700"
                                    whileHover={{ scale: 1.02 }}
                                >
                                    <p className="font-semibold break-all">{friend.email}</p>
                                </motion.div>
                            )) : <p className="text-sm text-white/50 text-center py-4">まだフレンドがいません。</p>}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ProfileScreen;