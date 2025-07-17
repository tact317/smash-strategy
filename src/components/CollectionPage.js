// src/components/CollectionPage.js (全文・改修版)

import React from 'react';
import { BarChart3, ChevronLeft} from 'lucide-react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { useData } from '../contexts/DataContext';
import { motion } from 'framer-motion';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const MiniBarChart = ({ wins, losses }) => {
    const data = {
        labels: [''],
        datasets: [
            {
                label: '勝利数',
                data: [wins],
                backgroundColor: 'rgba(74, 222, 128, 0.6)',
                borderColor: 'rgba(74, 222, 128, 1)',
                borderWidth: 1,
            },
            {
                label: '敗北数',
                data: [losses],
                backgroundColor: 'rgba(248, 113, 113, 0.6)',
                borderColor: 'rgba(248, 113, 113, 1)',
                borderWidth: 1,
            },
        ],
    };
    const options = {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        scales: { x: { stacked: true, display: false }, y: { stacked: true, display: false } },
        plugins: { legend: { display: false }, tooltip: { enabled: false } },
    };
    return <Bar data={data} options={options} />;
};


const CollectionPage = ({ onClose }) => {
  const { characters, characterData } = useData();

  const stats = characters.map(char => {
    const records = characterData[char.id]?.records || { wins: 0, losses: 0 };
    const total = records.wins + records.losses;
    const winRate = total > 0 ? ((records.wins / total) * 100) : 0;
    return {
      ...char,
      wins: records.wins,
      losses: records.losses,
      total,
      winRate: winRate.toFixed(1),
    };
  }).sort((a, b) => b.total - a.total); // 試合数が多い順にソート

  return (
    <div className="min-h-screen w-full text-white flex flex-col p-4 sm:p-8">
      <div className="flex justify-between items-center mb-8 flex-shrink-0">
        <h2 className="text-3xl sm:text-4xl font-bold text-white flex items-center gap-3">
          <BarChart3 size={32} />
          コレクション - 戦績一覧
        </h2>
        <button
          onClick={onClose}
          className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-all"
        >
          <ChevronLeft size={20} />
          ホームに戻る
        </button>
      </div>
      
      <div className="flex-grow w-full space-y-3 overflow-y-auto custom-scrollbar pr-2">
         {stats.map((char, index) => (
             <motion.div
                key={char.id}
                className="grid grid-cols-12 gap-4 items-center bg-white/5 hover:bg-white/10 p-4 rounded-lg transition-colors"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
             >
                <div className="col-span-3 lg:col-span-2 font-bold text-lg flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex-shrink-0 overflow-hidden" style={{ backgroundColor: char.color }}>
                        {char.icon && <img src={`/images/${encodeURIComponent(char.icon)}`} alt={char.name} className="w-full h-full object-contain" />}
                    </div>
                    <span>{char.name}</span>
                </div>
                <div className="col-span-3 lg:col-span-2 text-center">
                    <div className="text-sm text-white/60">勝率</div>
                    <div className="text-2xl font-bold text-cyan-400">{char.winRate}%</div>
                </div>
                <div className="col-span-3 lg:col-span-2 text-center">
                    <div className="text-sm text-white/60">試合数</div>
                    <div className="text-2xl font-bold">{char.total}</div>
                </div>
                <div className="col-span-3 lg:col-span-6 flex items-center gap-4">
                    <div className="text-right">
                        <span className="text-green-400 font-bold">{char.wins}</span>
                        <span className="text-white/50 mx-1">W</span>
                        <span className="text-red-400 font-bold">{char.losses}</span>
                        <span className="text-white/50 mx-1">L</span>
                    </div>
                    <div className="flex-grow h-6">
                        <MiniBarChart wins={char.wins} losses={char.losses} />
                    </div>
                </div>
             </motion.div>
         ))}
         {stats.length === 0 && (
            <div className="text-center py-16 text-white/50">
                <p>まだ戦績データがありません。</p>
                <p>各キャラクターの「戦績」タブから勝ち負けを記録してください。</p>
            </div>
         )}
      </div>
    </div>
  );
};

export default CollectionPage;