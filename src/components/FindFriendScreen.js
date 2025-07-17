import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, Search, UserPlus } from 'lucide-react';
import { db } from '../firebase';
import { collection, query, where, getDocs, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';

const FindFriendScreen = ({ onBack }) => {
    const { currentUser } = useAuth();
    const [searchEmail, setSearchEmail] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchEmail.trim()) return;
        setLoading(true);
        setMessage('');
        setSearchResults([]);

        const q = query(collection(db, "users"), where("email", "==", searchEmail.trim()));
        const querySnapshot = await getDocs(q);
        
        const users = [];
        querySnapshot.forEach((doc) => {
            // 自分自身は検索結果から除外
            if(doc.id !== currentUser.uid) {
                users.push({ id: doc.id, ...doc.data() });
            }
        });

        setSearchResults(users);
        if (users.length === 0) {
            setMessage('ユーザーが見つかりませんでした。');
        }
        setLoading(false);
    };

    const handleSendRequest = async (targetUserId) => {
        if (!currentUser) return;
        
        // 自分自身へのフレンドリクエストパス
        const myRequestRef = doc(db, "users", currentUser.uid, "friendRequests", targetUserId);
        // 相手へのフレンドリクエストパス
        const targetRequestRef = doc(db, "users", targetUserId, "friendRequests", currentUser.uid);

        try {
            // 自分側に「送信済み」リクエストを作成
            await setDoc(myRequestRef, { status: 'sent', createdAt: serverTimestamp() });
            // 相手側に「受信」リクエストを作成
            await setDoc(targetRequestRef, { status: 'received', from: currentUser.email, createdAt: serverTimestamp() });
            alert('フレンド申請を送信しました。');
        } catch (error) {
            console.error("フレンド申請エラー: ", error);
            alert('フレンド申請に失敗しました。');
        }
    };

    return (
        <div className="w-screen h-screen bg-slate-900 flex flex-col text-white p-4 sm:p-8">
            <header className="flex-shrink-0 mb-8 flex justify-between items-center">
                <h1 className="text-3xl font-bold">フレンドを探す</h1>
                <button onClick={onBack} className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-white/10">
                    <ChevronLeft size={20} />戻る
                </button>
            </header>
            <main className="flex-grow flex flex-col items-center">
                <form onSubmit={handleSearch} className="w-full max-w-lg flex gap-2 mb-8">
                    <input
                        type="email"
                        value={searchEmail}
                        onChange={(e) => setSearchEmail(e.target.value)}
                        placeholder="メールアドレスで検索"
                        className="flex-grow bg-slate-700 p-3 rounded-md"
                    />
                    <button type="submit" disabled={loading} className="p-3 bg-purple-600 rounded-md hover:bg-purple-700 disabled:bg-gray-500">
                        <Search />
                    </button>
                </form>

                <div className="w-full max-w-lg space-y-3">
                    {loading && <p>検索中...</p>}
                    {message && <p className="text-white/60">{message}</p>}
                    {searchResults.map(user => (
                        <motion.div key={user.id} className="bg-black/20 p-4 rounded-lg flex justify-between items-center" initial={{opacity:0}} animate={{opacity:1}}>
                            <p className="font-semibold">{user.email}</p>
                            <button onClick={() => handleSendRequest(user.id)} className="px-3 py-1 bg-green-600 rounded-md hover:bg-green-700 flex items-center gap-1 text-sm">
                                <UserPlus size={16}/>申請
                            </button>
                        </motion.div>
                    ))}
                </div>
            </main>
        </div>
    );
};

export default FindFriendScreen;