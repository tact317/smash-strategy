import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, UploadCloud, Loader } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';
import { useData } from '../contexts/DataContext';

const StartGgImporter = ({ onBack }) => {
    const { settings } = useSettings();
    const { addMatchRecord, characters } = useData();
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');

    const handleImport = async () => {
        const { startggToken, startggUserSlug } = settings;
        if (!startggToken || !startggUserSlug) {
            setMessage('先に設定画面でstart.ggのAPIトークンとユーザースラッグを設定してください。');
            return;
        }

        setIsLoading(true);
        setMessage('start.ggからデータを取得しています...');

        const query = `
            query UserSets($userSlug: String!) {
              user(slug: $userSlug) {
                player {
                  id
                  recentSets(page: 1, perPage: 20) {
                    nodes {
                      id
                      winnerId
                      slots {
                        entrant {
                          id
                          name
                          participants {
                            player {
                                id
                                gamerTag
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
        `;

        try {
            const response = await fetch('https://api.start.gg/gql/alpha', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${startggToken}`,
                },
                body: JSON.stringify({
                    query,
                    variables: { userSlug: startggUserSlug },
                }),
            });

            const result = await response.json();

            if (result.errors) {
                throw new Error(result.errors.map(e => e.message).join('\n'));
            }
            
            const sets = result.data.user.player.recentSets.nodes;
            const myPlayerId = result.data.user.player.id;
            let importedCount = 0;

            sets.forEach(set => {
                const mySlot = set.slots.find(s => s.entrant.participants[0].player.id === myPlayerId);
                const opponentSlot = set.slots.find(s => s.entrant.participants[0].player.id !== myPlayerId);

                if (mySlot && opponentSlot) {
                    const myCharacterName = mySlot.entrant.name.split(' (')[0].trim();
                    const myCharacter = characters.find(c => c.name === myCharacterName);
                    
                    if(myCharacter) {
                        const result = set.winnerId === mySlot.entrant.id ? 'win' : 'loss';
                        const opponentName = opponentSlot.entrant.participants[0].player.gamerTag;
                        addMatchRecord(myCharacter.id, opponentName, result);
                        importedCount++;
                    }
                }
            });

            setMessage(`${importedCount}件の対戦結果をインポートしました！`);

        } catch (error) {
            console.error('start.gg API error:', error);
            setMessage(`エラー: データの取得に失敗しました。トークンやスラッグが正しいか確認してください。詳細: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-screen h-screen bg-slate-900 flex flex-col text-white p-4 sm:p-8">
            <header className="flex-shrink-0 mb-8 flex justify-between items-center">
                <h1 className="text-3xl font-bold">大会結果のインポート</h1>
                <button onClick={onBack} className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-white/10">
                    <ChevronLeft size={20} />メニューに戻る
                </button>
            </header>
            <main className="flex-grow flex flex-col items-center justify-center text-center">
                <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} className="w-full max-w-lg">
                    <button 
                        onClick={handleImport} 
                        disabled={isLoading}
                        className="w-full px-8 py-6 bg-indigo-600 rounded-lg text-xl font-bold flex items-center justify-center gap-3 hover:bg-indigo-700 disabled:bg-gray-500"
                    >
                        {isLoading ? <Loader className="animate-spin" /> : <UploadCloud />}
                        最新の大会結果を取得する
                    </button>
                    {/* ★★★ ここが修正点です ★★★ */}
                    {/* 閉じタグの前の `>` が余分でした */}
                    {message && <p className="mt-6 text-white/80">{message}</p>}
                </motion.div>
            </main>
        </div>
    );
};

export default StartGgImporter;