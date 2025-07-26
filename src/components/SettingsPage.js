import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { X, Plus, Trash2, Edit, Check, Upload, Download, User, Link as LinkIcon } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { useSettings } from '../contexts/SettingsContext';
import { useUI } from '../contexts/UIContext';
import { useAudioSettings } from '../contexts/AudioSettingsContext';
import { useModal } from '../contexts/ModalContext';
import { collectionItems } from '../data/collection';
import { useBackupSystem } from '../hooks/useBackupSystem';
import ControllerSettings from './ControllerSettings';

const CommandBuilder = ({ command, setCommand }) => {
    const currentCommand = Array.isArray(command) ? command : [];
    const commandParts = [ 'stick-n', 'stick-u', 'stick-d', 'stick-l', 'stick-r', 'stick-ul', 'stick-ur', 'stick-dl', 'stick-dr', 'flick-u', 'flick-d', 'flick-l', 'flick-r', 'button-a', 'button-b', 'button-jump', 'button-grab', 'stick-lr', 'flick-lr' ];
    const addPart = (part) => { setCommand(prev => [...(Array.isArray(prev) ? prev : []), part]); };
    const removeLastPart = () => { setCommand(prev => (Array.isArray(prev) ? prev.slice(0, -1) : [])); };
    return (
        <div className="bg-slate-900/50 p-4 rounded-lg">
            <div className="bg-black/50 min-h-[64px] rounded-md mb-4 flex items-center p-2 gap-1 overflow-x-auto custom-scrollbar">
                {currentCommand.map((part, index) => ( <React.Fragment key={index}> {index > 0 && <span className="text-2xl font-bold text-purple-400 mx-1">+</span>} <img src={`/images/command-parts/${part}.svg`} alt={part} className="h-10"/> </React.Fragment> ))}
            </div>
            <div className="grid grid-cols-5 sm:grid-cols-8 gap-2">
                {commandParts.map(part => ( <button key={part} onClick={() => addPart(part)} className="bg-slate-700 hover:bg-slate-600 rounded-md p-2 flex items-center justify-center aspect-square transition-transform hover:scale-110"> <img src={`/images/command-parts/${part}.svg`} alt={part} className="h-full"/> </button> ))}
            </div>
             <button onClick={removeLastPart} className="bg-red-800 hover:bg-red-700 rounded-md p-2 mt-2 w-full"> <span className="text-white font-bold">1つ戻す</span> </button>
        </div>
    );
};

const CommandManager = ({ categories }) => {
    const { commands, handleAddCommand, handleUpdateCommand, handleDeleteCommand } = useData();
    const { showConfirm } = useModal();
    const [editingCmd, setEditingCmd] = useState(null);
    const [newName, setNewName] = useState('');
    const [newCommand, setNewCommand] = useState([]);
    const [newCategory, setNewCategory] = useState(categories[0]);
    const handleAddNew = () => { if (newName && newCommand.length > 0) { handleAddCommand({ name: newName, command: newCommand, category: newCategory }); setNewName(''); setNewCommand([]); } };
    const handleSaveEdit = () => { if (editingCmd) { const commandToSave = Array.isArray(editingCmd.command) ? editingCmd.command : []; handleUpdateCommand({ ...editingCmd, command: commandToSave }); setEditingCmd(null); } };
    const startEditing = (cmd) => { setEditingCmd({ ...cmd }); };

    const handleDelete = async (id) => {
        const confirmed = await showConfirm("コマンド削除", "このコマンドを削除しますか？");
        if (confirmed) {
            handleDeleteCommand(id);
        }
    };

    return (
        <div className="bg-white/5 p-6 rounded-lg h-full flex flex-col">
            <h3 className="text-xl font-semibold mb-4 text-white">コマンドリスト管理</h3>
            <div className="bg-black/20 p-4 rounded-md mb-6 space-y-3">
                <h4 className="font-bold text-white/80">新しいコマンドを追加</h4>
                <input type="text" value={newName} onChange={e => setNewName(e.target.value)} placeholder="コマンド名 (例: 空中上A)" className="w-full bg-slate-900/50 p-2 rounded-md border border-white/10"/>
                <CommandBuilder command={newCommand} setCommand={setNewCommand} />
                <div className="flex justify-between items-center">
                    <select value={newCategory} onChange={e => setNewCategory(e.target.value)} className="w-full bg-slate-700 p-2 rounded-md border border-white/10">
                        {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                    <button onClick={handleAddNew} className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md font-semibold flex items-center gap-2 ml-4 whitespace-nowrap"><Plus size={18}/>追加</button>
                </div>
            </div>
            <div className="space-y-2 flex-grow overflow-y-auto pr-2 custom-scrollbar">
                {commands.map(cmd => (
                    <motion.div key={cmd.id} layout className="bg-black/20 p-3 rounded-md">
                        {editingCmd && editingCmd.id === cmd.id ? (
                            <div className="space-y-3">
                                <input type="text" value={editingCmd.name} onChange={e => setEditingCmd({...editingCmd, name: e.target.value})} className="w-full bg-slate-900/50 p-2 rounded-md border border-white/10"/>
                                <CommandBuilder command={editingCmd.command} setCommand={(updater) => { setEditingCmd(prevEditingCmd => { const currentCmd = Array.isArray(prevEditingCmd.command) ? prevEditingCmd.command : []; return { ...prevEditingCmd, command: updater(currentCmd) }; }); }} />
                                <div className="flex justify-between">
                                    <select value={editingCmd.category} onChange={e => setEditingCmd({...editingCmd, category: e.target.value})} className="bg-slate-700 p-2 rounded-md border border-white/10"> {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)} </select>
                                    <div className="flex gap-2"> <button onClick={() => setEditingCmd(null)} className="p-2 rounded-full hover:bg-white/10"><X size={18}/></button> <button onClick={handleSaveEdit} className="p-2 rounded-full bg-green-600 hover:bg-green-700"><Check size={18}/></button> </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="font-semibold text-white">{cmd.name} <span className="text-xs text-white/50">({cmd.category})</span></p>
                                    <div className="flex items-center gap-1 mt-1 flex-wrap"> {Array.isArray(cmd.command) ? cmd.command.map((part, index) => ( <React.Fragment key={index}> {index > 0 && <span className="text-lg font-bold text-purple-300">+</span>} <img src={`/images/command-parts/${part}.svg`} alt={part} className="h-6"/> </React.Fragment> )) : <p className="text-sm text-white/60 font-mono">{cmd.command}</p>} </div>
                                </div>
                                <div className="flex gap-2"> <button onClick={() => startEditing(cmd)} className="text-yellow-400 hover:text-yellow-300 p-2 rounded-full hover:bg-white/10"><Edit size={18}/></button> <button onClick={() => handleDelete(cmd.id)} className="text-red-400 hover:text-red-500 p-2 rounded-full hover:bg-white/10"><Trash2 size={18}/></button> </div>
                            </div>
                        )}
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

const SoundSettings = () => {
    const { settings, setSetting, assignments, setAssignment } = useAudioSettings();
    const { unlockedItems } = useData();
    const unlockedBgms = Object.values(collectionItems).filter(item => item.type === 'bgm' && unlockedItems.includes(item.id));
    const unlockedSes = Object.values(collectionItems).filter(item => item.type === 'se' && unlockedItems.includes(item.id));
    const settingItems = { "BGM": [ { key: 'bgm_splash', label: 'スプラッシュ画面' }, { key: 'bgm_home', label: 'ホーム画面' }, ], "効果音 (SE)": [ { key: 'se_click', label: '決定・クリック音' }, ] };
    return (
        <section className="bg-white/5 p-6 rounded-lg">
            <h2 className="text-2xl font-semibold mb-4">サウンド設定</h2>
            <div className="space-y-4">
                <div className="flex items-center justify-between"><label className="text-lg">BGM</label><button onClick={() => setSetting('isBgmEnabled', !settings.isBgmEnabled)} className={`w-14 h-8 rounded-full p-1 transition-colors ${settings.isBgmEnabled ? 'bg-green-500' : 'bg-gray-600'}`}><span className={`block w-6 h-6 rounded-full bg-white transform transition-transform ${settings.isBgmEnabled ? 'translate-x-6' : 'translate-x-0'}`} /></button></div>
                <div className="flex items-center gap-4"><label>音量</label><input type="range" min="0" max="1" step="0.01" value={settings.bgmVolume} onChange={e => setSetting('bgmVolume', parseFloat(e.target.value))} disabled={!settings.isBgmEnabled} className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500 disabled:opacity-50"/></div>
                <div className="pt-4 border-t border-white/10 flex items-center justify-between"><label className="text-lg">効果音 (SE)</label><button onClick={() => setSetting('isSeEnabled', !settings.isSeEnabled)} className={`w-14 h-8 rounded-full p-1 transition-colors ${settings.isSeEnabled ? 'bg-green-500' : 'bg-gray-600'}`}><span className={`block w-6 h-6 rounded-full bg-white transform transition-transform ${settings.isSeEnabled ? 'translate-x-6' : 'translate-x-0'}`} /></button></div>
                <div className="flex items-center gap-4"><label>音量</label><input type="range" min="0" max="1" step="0.01" value={settings.seVolume} onChange={e => setSetting('seVolume', parseFloat(e.target.value))} disabled={!settings.isSeEnabled} className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500 disabled:opacity-50"/></div>
                <div className="pt-4 border-t border-white/10">
                    <h3 className="text-lg font-semibold mb-3">カスタマイズ</h3>
                    {Object.entries(settingItems).map(([category, items]) => (
                        <div key={category} className="space-y-2 mb-4">
                           <h4 className="font-bold text-white/70">{category}</h4>
                           {items.map(item => (
                               <div key={item.key} className="flex items-center justify-between">
                                   <label htmlFor={item.key}>{item.label}</label>
                                   <select id={item.key} value={assignments[item.key]} onChange={e => setAssignment(item.key, e.target.value)} className="bg-slate-700 p-2 rounded-md w-1/2">
                                       {(item.key.startsWith('bgm') ? unlockedBgms : unlockedSes).map(unlockedItem => (
                                           <option key={unlockedItem.id} value={unlockedItem.id}>{unlockedItem.name}</option>
                                       ))}
                                   </select>
                               </div>
                           ))}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

const BackupSettings = () => {
    const { exportAllData, importAllData } = useBackupSystem();
    const fileInputRef = useRef(null);
    const handleImportClick = () => { fileInputRef.current.click(); };
    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (!file) return;
        importAllData(file);
        event.target.value = null; 
    };
    return (
        <section className="bg-white/5 p-6 rounded-lg">
            <h2 className="text-2xl font-semibold mb-4">データ管理</h2>
            <div className="flex flex-col sm:flex-row gap-4">
                <button onClick={exportAllData} className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 font-semibold"><Download size={20} />エクスポート (バックアップ)</button>
                <button onClick={handleImportClick} className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-green-600 hover:bg-green-700 font-semibold"><Upload size={20} />インポート (復元)</button>
                <input type="file" accept=".json" onChange={handleFileChange} ref={fileInputRef} className="hidden" />
            </div>
            <p className="text-xs text-white/50 mt-4">現在の全データを一つのファイルとして保存したり、ファイルから復元したりします。PCの買い替え時などに利用してください。</p>
        </section>
    );
};

const StartGgSettings = () => {
    const { settings, updateSetting } = useSettings();
    const [token, setToken] = useState(settings.startggToken || '');
    const [slug, setSlug] = useState(settings.startggUserSlug || '');

    const handleSave = () => {
        updateSetting('startggToken', token);
        updateSetting('startggUserSlug', slug);
        alert('start.ggの設定を保存しました。');
    };

    return (
        <section className="bg-white/5 p-6 rounded-lg">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                <LinkIcon />
                start.gg 連携設定
            </h2>
            <div className="space-y-4">
                <div>
                    <label htmlFor="startgg-token" className="block text-sm font-medium text-gray-300 mb-1">APIトークン</label>
                    <input id="startgg-token" type="password" value={token} onChange={e => setToken(e.target.value)} placeholder="取得したAPIトークンを貼り付け" className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white"/>
                </div>
                <div>
                    <label htmlFor="startgg-slug" className="block text-sm font-medium text-gray-300 mb-1">ユーザースラッグ</label>
                    <input id="startgg-slug" type="text" value={slug} onChange={e => setSlug(e.target.value)} placeholder="例: user/abcdefg" className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white"/>
                    <p className="text-xs text-white/50 mt-1">※ start.ggのプロフィールページのURL末尾 (例: `start.gg/user/abcdef` の `user/abcdef` の部分)</p>
                </div>
                <div className="flex justify-end">
                    <button onClick={handleSave} className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-md font-semibold">保存</button>
                </div>
            </div>
        </section>
    );
};

const SettingsPage = ({ onNavigate, onClose, commandCategories }) => {
    const { settings, updateSetting } = useSettings();
    const { quizzes, setQuizzes } = useData();
    const { setCursorVariant } = useUI();
    const [newQuestion, setNewQuestion] = useState('');
    const [options, setOptions] = useState(['', '', '', '']);
    const [correctAnswer, setCorrectAnswer] = useState('');
    const handleOptionChange = (index, value) => { const newOptions = [...options]; newOptions[index] = value; setOptions(newOptions); };
    const handleAddQuiz = () => { if (!newQuestion || options.some(opt => opt === '') || !correctAnswer) { alert('すべての項目を入力してください。'); return; } const newQuiz = { id: Date.now(), question: newQuestion, options, answer: correctAnswer }; setQuizzes(prev => [...prev, newQuiz]); setNewQuestion(''); setOptions(['', '', '', '']); setCorrectAnswer(''); };
    const handleDeleteQuiz = (id) => { setQuizzes(prev => prev.filter(quiz => quiz.id !== id)); };
    return (
        <div className="w-screen h-screen bg-slate-900/80 backdrop-blur-xl p-4 sm:p-8 overflow-y-auto custom-scrollbar" onMouseEnter={() => setCursorVariant('default')}>
            <div className="max-w-7xl mx-auto text-white">
                <motion.div initial={{opacity: 0, y: -20}} animate={{opacity: 1, y: 0}} className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl sm:text-4xl font-bold">設定</h1>
                    <div className="flex items-center gap-2">
                        <button onClick={() => onNavigate('profile')} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20" onMouseEnter={() => setCursorVariant('hover')} onMouseLeave={() => setCursorVariant('default')}>
                            <User size={20} />
                            プロフィール
                        </button>
                        <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10" onMouseEnter={() => setCursorVariant('hover')} onMouseLeave={() => setCursorVariant('default')}><X size={32} /></button>
                    </div>
                </motion.div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="space-y-8">
                        <motion.div initial={{opacity: 0, y: 20}} animate={{opacity: 1, y: 0}} transition={{delay: 0.1}}><StartGgSettings /></motion.div>
                        <motion.div initial={{opacity: 0, y: 20}} animate={{opacity: 1, y: 0}} transition={{delay: 0.15}}><BackupSettings /></motion.div>
                        <motion.div initial={{opacity: 0, y: 20}} animate={{opacity: 1, y: 0}} transition={{delay: 0.2}}><SoundSettings /></motion.div>
                        <motion.div initial={{opacity: 0, y: 20}} animate={{opacity: 1, y: 0}} transition={{delay: 0.3}}><ControllerSettings /></motion.div>
                        <motion.section initial={{opacity: 0, y: 20}} animate={{opacity: 1, y: 0}} transition={{delay: 0.25}} className="bg-white/5 p-6 rounded-lg">
                            <h2 className="text-2xl font-semibold mb-4">ゲリラクイズ設定</h2>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between"><label htmlFor="guerilla-toggle" className="text-lg">ゲリラクイズを有効にする</label><button id="guerilla-toggle" onClick={() => updateSetting('isGuerillaEnabled', !settings.isGuerillaEnabled)} className={`w-14 h-8 rounded-full p-1 transition-colors ${settings.isGuerillaEnabled ? 'bg-green-500' : 'bg-gray-600'}`}><span className={`block w-6 h-6 rounded-full bg-white transform transition-transform ${settings.isGuerillaEnabled ? 'translate-x-6' : 'translate-x-0'}`} /></button></div>
                                <div className="flex items-center justify-between"><label htmlFor="guerilla-frequency" className="text-lg">発生頻度（分）</label><select id="guerilla-frequency" value={settings.guerillaFrequency / 60000} onChange={(e) => updateSetting('guerillaFrequency', Number(e.target.value) * 60000)} className="bg-slate-700 border border-slate-600 rounded-md p-2"><option value="1">1分</option><option value="3">3分</option><option value="5">5分</option><option value="10">10分</option><option value="15">15分</option></select></div>
                            </div>
                        </motion.section>
                        <motion.section initial={{opacity: 0, y: 20}} animate={{opacity: 1, y: 0}} transition={{delay: 0.35}}>
                            <h2 className="text-2xl font-semibold mb-4">クイズ管理</h2>
                            <div className="bg-white/5 p-6 rounded-lg mb-6 space-y-4"><h3 className="text-xl font-medium">新しいクイズを追加</h3><input type="text" placeholder="問題文" value={newQuestion} onChange={(e) => setNewQuestion(e.target.value)} className="w-full bg-slate-700 p-2 rounded-md"/><div className="grid grid-cols-2 gap-4">{options.map((opt, i) => ( <input key={i} type="text" placeholder={`選択肢 ${i + 1}`} value={opt} onChange={(e) => handleOptionChange(i, e.target.value)} className="bg-slate-700 p-2 rounded-md"/> ))}</div><select value={correctAnswer} onChange={(e) => setCorrectAnswer(e.target.value)} className="w-full bg-slate-700 p-2 rounded-md"><option value="">正解の選択肢を選んでください</option>{options.filter(opt => opt).map((opt, i) => (<option key={i} value={opt}>{opt}</option>))}</select><button onClick={handleAddQuiz} className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md font-semibold flex items-center gap-2"><Plus size={18}/>追加する</button></div>
                            <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">{quizzes.map(quiz => ( <div key={quiz.id} className="bg-black/20 p-4 rounded-md flex justify-between items-center gap-4"><p className="flex-grow break-words">{quiz.question}</p><button onClick={() => handleDeleteQuiz(quiz.id)} className="text-red-400 hover:text-red-500 p-2 flex-shrink-0"><Trash2 size={20}/></button></div> ))}</div>
                        </motion.section>
                    </div>
                    <motion.section initial={{opacity: 0, y: 20}} animate={{opacity: 1, y: 0}} transition={{delay: 0.4}}>
                        <CommandManager categories={commandCategories} />
                    </motion.section>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;
