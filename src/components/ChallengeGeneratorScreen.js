import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, RefreshCw } from 'lucide-react';
import { useData } from '../contexts/DataContext'; // ★ DataContextをインポート

// 課題のテンプレート
const challengeTemplates = [
    "{{character}}を使って、一度もシールドを使わずに勝利する",
    "{{character}}の空中攻撃だけで相手を撃墜する",
    "{{character}}で、相手の飛び道具を3回ジャストシールドする",
    "{{character}}で、相手の最後のストックをメテオで撃墜する",
    "{{character}}を使い、アピールを3回してから勝利する",
    "{{character}}で、ステージ中央から一切動かずに相手を撃墜する"
];

const ChallengeGeneratorScreen = ({ onBack }) => {
    const { characters } = useData(); // ★ 登録済みのキャラクターリストを取得
    const [currentChallenge, setCurrentChallenge] = useState('ボタンを押して課題を生成しよう！');

    const generateChallenge = () => {
        // ★ キャラクターが登録されているかチェック
        if (characters.length === 0) {
            setCurrentChallenge("キャラクターが登録されていません。先にキャラクター選択画面から追加してください。");
            return;
        }

        // ★ ランダムにキャラクターと課題テンプレートを選択
        const randomCharacter = characters[Math.floor(Math.random() * characters.length)];
        const randomTemplate = challengeTemplates[Math.floor(Math.random() * challengeTemplates.length)];
        
        // ★ テンプレート内の{{character}}をランダムなキャラクター名に置き換え
        const newChallenge = randomTemplate.replace("{{character}}", randomCharacter.name);
        
        setCurrentChallenge(newChallenge);
    };

    return (
        <div className="w-screen h-screen bg-slate-900 flex flex-col text-white p-8">
            <header className="flex-shrink-0 mb-8 flex justify-between items-center">
                <h1 className="text-3xl font-bold">ランダム課題ジェネレーター</h1>
                <button onClick={onBack} className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-white/10">
                    <ChevronLeft size={20} />戻る
                </button>
            </header>

            <main className="flex-grow flex flex-col items-center justify-center text-center">
                <div 
                    className="bg-black/20 p-8 rounded-lg border-2 border-purple-500/50 min-h-[200px] w-full max-w-2xl flex items-center justify-center"
                >
                    {/* ★ AnimatePresenceで文字の切り替えをアニメーションさせる */}
                    <AnimatePresence mode="wait">
                        <motion.p 
                            key={currentChallenge}
                            className="text-3xl font-semibold"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                        >
                            {currentChallenge}
                        </motion.p>
                    </AnimatePresence>
                </div>

                <motion.button
                    onClick={generateChallenge}
                    className="mt-8 px-8 py-4 bg-purple-600 rounded-lg text-xl font-bold flex items-center gap-3"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <RefreshCw size={24} />
                    新しい課題を生成
                </motion.button>
            </main>
        </div>
    );
};

export default ChallengeGeneratorScreen;