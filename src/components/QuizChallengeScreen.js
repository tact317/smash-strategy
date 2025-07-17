import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, X, Heart, ShieldCheck, Star, HelpCircle } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { usePlayerStats } from '../contexts/PlayerStatsContext';
import QuizModal from './QuizModal';

const QuizChallengeScreen = ({ onBack }) => {
    const { quizzes, generatePersonalQuiz, unlockItem } = useData();
    const { stats, addPoints, spendPoints } = usePlayerStats();
    
    const [gameState, setGameState] = useState('start'); // 'start', 'playing', 'result'
    const [challengeQuizzes, setChallengeQuizzes] = useState([]);
    const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
    const [lives, setLives] = useState(3);
    const [correctAnswers, setCorrectAnswers] = useState(0);

    const CHALLENGE_COST = 50; // チャレンジの挑戦に必要なポイント
    const CLEAR_REWARD_ITEM = 'bgm_calm'; // 仮のクリア報酬アイテムID

    const startChallenge = useCallback(() => {
        if (!spendPoints(CHALLENGE_COST)) return;

        const allQuizzes = [...quizzes];
        for (let i = 0; i < 5; i++) {
            const personalQuiz = generatePersonalQuiz();
            if (personalQuiz) allQuizzes.push(personalQuiz);
        }
        const selectedQuizzes = allQuizzes.sort(() => 0.5 - Math.random()).slice(0, 5);
        
        setChallengeQuizzes(selectedQuizzes);
        setCurrentQuizIndex(0);
        setLives(3);
        setCorrectAnswers(0);
        setGameState('playing');
    }, [quizzes, generatePersonalQuiz, spendPoints]);

    const handleQuizClose = (isCorrect) => {
        let currentLives = lives;
        if (isCorrect) {
            setCorrectAnswers(c => c + 1);
        } else {
            currentLives = lives - 1;
            setLives(currentLives);
        }

        const nextIndex = currentQuizIndex + 1;
        if (nextIndex >= challengeQuizzes.length || currentLives <= 0) {
            setGameState('result');
            // 全問正解ボーナス
            if (nextIndex >= challengeQuizzes.length && currentLives > 0) {
                addPoints(100); // ポイント報酬を増量
                unlockItem(CLEAR_REWARD_ITEM); // アイテムをアンロック
            }
        } else {
            setCurrentQuizIndex(nextIndex);
        }
    };

    const currentQuiz = gameState === 'playing' ? challengeQuizzes[currentQuizIndex] : null;

    // --- 各画面のレンダリング ---

    if (gameState === 'start') {
        return (
            <div className="w-screen h-screen bg-slate-900 flex flex-col items-center justify-center text-white p-8 text-center">
                <h1 className="text-5xl font-bold mb-4">ゲリラチャレンジ</h1>
                <p className="text-xl text-white/80 mb-8">5問連続のクイズに挑戦！3回間違えると失敗だ。</p>
                <div className="bg-black/20 p-6 rounded-lg space-y-4 max-w-md mx-auto mb-8">
                    <div className="flex justify-between"><span className="font-semibold">挑戦料:</span> <span className="font-bold text-orange-400">{CHALLENGE_COST} SP</span></div>
                    <div className="flex justify-between"><span className="font-semibold">クリア報酬:</span> <span className="font-bold text-yellow-400">100 SP + ???</span></div>
                </div>
                <button onClick={startChallenge} disabled={stats.points < CHALLENGE_COST} className="px-10 py-4 bg-purple-600 hover:bg-purple-700 rounded-lg font-bold text-xl disabled:bg-gray-600 disabled:cursor-not-allowed">挑戦する</button>
                <button onClick={onBack} className="mt-4 text-white/60 hover:text-white">メニューに戻る</button>
            </div>
        );
    }
    
    if (gameState === 'result') {
        const isClear = correctAnswers === challengeQuizzes.length;
        return (
            <div className="w-screen h-screen bg-slate-900 flex flex-col items-center justify-center text-white p-8">
                <motion.div initial={{scale:0.8, opacity:0}} animate={{scale:1, opacity:1}} className="text-center">
                    <h2 className={`text-5xl font-bold mb-4 ${isClear ? 'text-yellow-400' : 'text-gray-500'}`}>{isClear ? 'CHALLENGE CLEAR!' : 'CHALLENGE FAILED...'}</h2>
                    <p className="text-2xl mb-8">結果: {correctAnswers} / {challengeQuizzes.length} 問正解</p>
                    <div className="flex gap-4">
                        <button onClick={startChallenge} disabled={stats.points < CHALLENGE_COST} className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold disabled:bg-gray-600">もう一度挑戦</button>
                        <button onClick={onBack} className="px-6 py-3 bg-slate-600 hover:bg-slate-700 rounded-lg">メニューに戻る</button>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="w-screen h-screen bg-slate-900/80 backdrop-blur-xl flex flex-col text-white p-4 sm:p-8">
            <header className="flex-shrink-0 flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">ゲリラチャレンジ ({currentQuizIndex + 1}/{challengeQuizzes.length})</h1>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1 text-green-400 font-bold"><ShieldCheck size={20} /> {correctAnswers}</div>
                    <div className="flex items-center gap-1 text-red-400 font-bold"><Heart size={20} /> {lives}</div>
                </div>
            </header>
            <main className="flex-grow relative">
                {currentQuiz && (
                    <QuizModal key={currentQuizIndex} quiz={currentQuiz} onClose={handleQuizClose} />
                )}
            </main>
        </div>
    );
};

export default QuizChallengeScreen;