// src/components/tabs/VideoLinksTab.js (全文・クリーンアップ版)
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2 } from 'lucide-react';

const VideoLinksTab = ({ characterData, updateCharacterData }) => {
    const videoLinks = characterData.videoLinks || [];
    const [title, setTitle] = useState('');
    const [url, setUrl] = useState('');

    const handleAddLink = () => {
        if (!url.trim() || !title.trim()) {
            alert('タイトルとURLを両方入力してください。');
            return;
        }
        const newLink = { id: Date.now(), title, url };
        updateCharacterData(['videoLinks'], [...videoLinks, newLink]);
        setTitle('');
        setUrl('');
    };

    const handleDeleteLink = (id) => {
        updateCharacterData(['videoLinks'], videoLinks.filter(link => link.id !== id));
    };

    return (
        <div>
            <div className="bg-white/5 p-4 rounded-lg mb-6 flex flex-col sm:flex-row gap-4">
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="動画のタイトル"
                    className="w-full sm:w-1/3 bg-slate-700 p-2 rounded-md"
                />
                <input
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://youtube.com/..."
                    className="flex-grow bg-slate-700 p-2 rounded-md"
                />
                <button onClick={handleAddLink} className="px-4 py-2 bg-purple-600 rounded-md hover:bg-purple-700 flex items-center justify-center gap-2">
                    <Plus size={18} />追加
                </button>
            </div>
            <div className="space-y-3">
                {videoLinks.map((link, index) => (
                    <motion.div
                        key={link.id}
                        className="bg-black/20 p-4 rounded-lg flex justify-between items-center"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                    >
                        <div>
                            <p className="font-semibold">{link.title}</p>
                            <a
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-cyan-400 hover:underline break-all"
                            >
                                {link.url}
                            </a>
                        </div>
                        <button onClick={() => handleDeleteLink(link.id)} className="text-red-400 hover:text-red-300 p-2 flex-shrink-0 ml-4"><Trash2 size={18} /></button>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default VideoLinksTab;