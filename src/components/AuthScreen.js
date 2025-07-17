import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';

const AuthScreen = () => {
    const [isLoginView, setIsLoginView] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { signup, login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (isLoginView) {
                await login(email, password);
            } else {
                await signup(email, password);
            }
            // ログイン/新規登録が成功すると、AuthContextのonAuthStateChangedが検知して
            // App.js側で自動的に画面が切り替わるので、ここでの遷移処理は不要
        } catch (err) {
            setError(`エラー: ${err.message}`);
        }
        setLoading(false);
    };

    return (
        <div className="w-screen h-screen bg-slate-900 flex items-center justify-center p-4">
            <motion.div 
                layout
                className="w-full max-w-md bg-slate-800/50 rounded-2xl shadow-2xl p-8 border border-white/10"
            >
                <div className="flex mb-6 border-b border-slate-700">
                    <button onClick={() => setIsLoginView(true)} className={`flex-1 pb-3 font-bold text-lg relative ${isLoginView ? 'text-white' : 'text-white/50'}`}>
                        ログイン
                        {isLoginView && <motion.div className="absolute bottom-0 left-0 right-0 h-1 bg-purple-500" layoutId="auth-underline" />}
                    </button>
                    <button onClick={() => setIsLoginView(false)} className={`flex-1 pb-3 font-bold text-lg relative ${!isLoginView ? 'text-white' : 'text-white/50'}`}>
                        新規登録
                        {!isLoginView && <motion.div className="absolute bottom-0 left-0 right-0 h-1 bg-purple-500" layoutId="auth-underline" />}
                    </button>
                </div>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={isLoginView ? 'login' : 'signup'}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {error && <p className="bg-red-500/20 text-red-400 p-3 rounded-md text-sm">{error}</p>}
                            <input
                                type="email"
                                placeholder="メールアドレス"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white"
                                required
                            />
                            <input
                                type="password"
                                placeholder="パスワード (6文字以上)"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white"
                                required
                            />
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg font-bold text-lg disabled:bg-gray-500"
                            >
                                {loading ? '処理中...' : (isLoginView ? 'ログイン' : '登録する')}
                            </button>
                        </form>
                    </motion.div>
                </AnimatePresence>
            </motion.div>
        </div>
    );
};

export default AuthScreen;