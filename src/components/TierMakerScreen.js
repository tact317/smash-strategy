import React, { useState, useMemo, useEffect, useRef } from 'react';
import { DndContext, DragOverlay, PointerSensor, useSensor, useSensors, closestCenter } from '@dnd-kit/core';
import { SortableContext, arrayMove, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { createPortal } from 'react-dom';
import { useData } from '../contexts/DataContext';
import { useUI } from '../contexts/UIContext';
import { useModal } from '../contexts/ModalContext';
import { ChevronLeft, Plus, Save, Trash2, X, Share2, Copy } from 'lucide-react';
import { toPng } from 'html-to-image';
import { motion, AnimatePresence } from 'framer-motion';

const AddTierModal = ({ onClose, onAdd }) => {
    const [tierName, setTierName] = useState('');
    const handleSubmit = (e) => { e.preventDefault(); if (tierName.trim()) { onAdd(tierName.trim().toUpperCase()); } };
    return ( <motion.div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} > <motion.div className="bg-slate-800 rounded-xl p-6 w-full max-w-sm border border-green-500/30 shadow-2xl" initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }} > <div className="flex justify-between items-center mb-4"> <h3 className="text-xl font-bold text-white">新しいランクを追加</h3> <button onClick={onClose} className="text-gray-400 hover:text-white"><X size={24} /></button> </div> <form onSubmit={handleSubmit}> <input type="text" value={tierName} onChange={(e) => setTierName(e.target.value)} placeholder="ランク名 (例: F)" className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white mb-4" autoFocus /> <div className="flex justify-end gap-2"> <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-md"> キャンセル </button> <button type="submit" className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-md"> 追加する </button> </div> </form> </motion.div> </motion.div> );
};

function Character({ char }) { return ( <div className="w-16 h-16 rounded-md flex-shrink-0 border-2 border-slate-600" style={{ backgroundColor: char.color }}> {char.icon && <img src={`/images/${encodeURIComponent(char.icon)}`} alt={char.name} className="w-full h-full object-contain p-1" />} </div> );}
function SortableCharacter({ char }) { const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: char.id }); const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.3 : 1, }; return ( <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="touch-none"> <Character char={char} /> </div> );}
function TierContainer({ id, chars, onDeleteTier }) { const tierColors = { S: '#ff7f7f', A: '#ffbf7f', B: '#ffff7f', C: '#7fff7f', D: '#7fbfff', E: '#bf7fff', F: '#aaa', unranked: '#555' }; const { setNodeRef } = useSortable({ id }); const isSpecialTier = ['S', 'A', 'B', 'C', 'D', 'E', 'unranked'].includes(id); const labelText = id.toLocaleUpperCase(); const labelSizeClass = id.length > 1 ? 'text-lg font-semibold' : 'text-2xl font-bold'; return ( <SortableContext items={chars.map(c => c.id)}> <div ref={setNodeRef} className="flex items-stretch min-h-[96px]"> <div className={`w-28 flex-shrink-0 flex items-center justify-center rounded-l-lg ${labelSizeClass}`} style={{ backgroundColor: tierColors[id] || '#777' }}> {labelText} </div> <div className="flex-grow bg-slate-800/50 p-2 border-y-2 border-r-2 border-slate-700 rounded-r-lg min-w-[100px] flex items-center"> <div className="flex flex-wrap gap-2 flex-grow"> {chars.map(char => char && <SortableCharacter key={char.id} char={char} />)} </div> {!isSpecialTier && ( <button onClick={() => onDeleteTier(id)} className="ml-2 p-2 text-white/30 hover:text-red-500"><Trash2 size={16}/></button> )} </div> </div> </SortableContext> );}

const TierMakerScreen = ({ onBack }) => {
    const { characters, tierLists, setTierLists, activeTierListId, shareTierList } = useData();
    const { setCursorVariant } = useUI();
    const { showConfirm } = useModal();
    const [activeId, setActiveId] = useState(null);
    const tierListRef = useRef(null);
    const [isAddTierModalOpen, setIsAddTierModalOpen] = useState(false);
    const [sharedLink, setSharedLink] = useState('');
    const [isSharing, setIsSharing] = useState(false);

    const activeList = useMemo(() => tierLists.find(l => l.id === activeTierListId) || tierLists[0], [tierLists, activeTierListId]);
    const [items, setItems] = useState(activeList ? activeList.characterPlacements : {});

    useEffect(() => { if (activeList) { const characterIds = new Set(characters.map(c => c.id)); const allRankedIdsInStorage = new Set(Object.values(activeList.characterPlacements || {}).flat()); const newPlacements = { ...activeList.characterPlacements }; Object.keys(newPlacements).forEach(tier => { newPlacements[tier] = (newPlacements[tier] || []).filter(id => characterIds.has(id)); }); const newUnranked = characters.filter(c => !allRankedIdsInStorage.has(c.id)).map(c => c.id); newPlacements.unranked = [...new Set([...(newPlacements.unranked || []), ...newUnranked])]; setItems(newPlacements); } }, [characters, activeList]);
    const updateTierList = (placements, tiers, title) => { setTierLists(prevLists => { return prevLists.map(list => { if (list.id === activeTierListId) { const updatedList = { ...list }; if(placements) updatedList.characterPlacements = placements; if (tiers) updatedList.tiers = tiers; if (title) updatedList.title = title; return updatedList; } return list; }); }); };
    const getCharFromId = useMemo(() => { const charMap = new Map(characters.map(c => [c.id, c])); return (id) => charMap.get(id); }, [characters]);
    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));
    const findContainer = (id) => { if (id in items) return id; return Object.keys(items).find(key => items[key] && items[key].includes(id)); };
    const handleDragStart = (event) => { setCursorVariant('hover'); setActiveId(event.active.id); };
    const handleDragEnd = (event) => { const { active, over } = event; setActiveId(null); setCursorVariant('default'); if (!over) return; const activeContainer = findContainer(active.id); let overContainer = findContainer(over.id); if (!overContainer && activeList.tiers.concat(['unranked']).includes(over.id)) { overContainer = over.id; } if (!activeContainer || !overContainer) return; let newItems = { ...items }; if (activeContainer !== overContainer) { const activeItems = newItems[activeContainer]; const overItems = newItems[overContainer]; const overIndex = over.id in newItems ? overItems.length : overItems.indexOf(over.id); newItems[activeContainer] = activeItems.filter((id) => id !== active.id); if (overIndex !== -1) { newItems[overContainer].splice(overIndex, 0, active.id); } else { newItems[overContainer].push(active.id); } } else { const activeIndex = newItems[activeContainer].indexOf(active.id); const overIndex = newItems[activeContainer].indexOf(over.id); if (activeIndex !== overIndex) { newItems[activeContainer] = arrayMove(newItems[activeContainer], activeIndex, overIndex); } } setItems(newItems); updateTierList(newItems); };
    const handleAddNewTier = (newTierName) => { if (newTierName && activeList && !activeList.tiers.includes(newTierName)) { const newTiers = [...activeList.tiers, newTierName]; const newPlacements = { ...items, [newTierName]: [] }; setItems(newPlacements); updateTierList(newPlacements, newTiers); } setIsAddTierModalOpen(false); };
    
    const handleDeleteTier = async (tierName) => {
        const confirmed = await showConfirm("ランクの削除", `「${tierName}」ランクを削除しますか？このランクのキャラは未分類に移動します。`);
        if (confirmed) {
            const newTiers = activeList.tiers.filter(t => t !== tierName);
            const newPlacements = { ...items };
            const unrankedChars = newPlacements[tierName] || [];
            newPlacements.unranked = [...newPlacements.unranked, ...unrankedChars];
            delete newPlacements[tierName];
            setItems(newPlacements);
            updateTierList(newPlacements, newTiers);
        }
    };
    
    const handleSaveAsImage = () => { if (tierListRef.current) { toPng(tierListRef.current, { backgroundColor: '#1e293b' }).then((dataUrl) => { const link = document.createElement('a'); link.download = `${activeList.title.replace(/\s/g, '_')}.png`; link.href = dataUrl; link.click(); }).catch((err) => console.error('oops, something went wrong!', err)); } };
    const handleShare = async () => { setIsSharing(true); const shareId = await shareTierList({ title: activeList.title, tiers: activeList.tiers, placements: items, characters: characters.filter(c => Object.values(items).flat().includes(c.id)) }); if (shareId) { const link = `https://smash-strategy-notebook.web.app/view/${shareId}`; setSharedLink(link); } else { alert("共有に失敗しました。コンソールログを確認してください。"); } setIsSharing(false); };
    const copyToClipboard = async () => { if (!sharedLink) return; try { await navigator.clipboard.writeText(sharedLink); alert('リンクをコピーしました！'); } catch (err) { console.error('クリップボードへのコピーに失敗しました: ', err); alert('コピーに失敗しました。'); } };
    const activeCharacter = activeId ? getCharFromId(activeId) : null;

    return (
        <div className="w-screen h-screen bg-slate-900 flex flex-col text-white p-4 sm:p-8" onMouseEnter={() => setCursorVariant('default')}>
            <header className="flex-shrink-0 mb-6 space-y-4">
                <div className="flex justify-between items-center"> <h1 className="text-3xl sm:text-4xl font-bold">{activeList?.title || 'Tier表'}</h1> <button onClick={onBack} className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-white/10"><ChevronLeft size={20} />Tier表一覧に戻る</button> </div>
                <div className="flex flex-wrap gap-2">
                    <button onClick={() => setIsAddTierModalOpen(true)} className="px-3 py-1 bg-green-600 rounded hover:bg-green-700">ランク追加</button>
                    <button onClick={handleSaveAsImage} className="px-3 py-1 bg-blue-600 rounded hover:bg-blue-700 flex items-center gap-2"><Save size={16}/>画像として保存</button>
                    <button onClick={handleShare} disabled={isSharing} className="px-3 py-1 bg-purple-600 rounded hover:bg-purple-700 flex items-center gap-2 disabled:bg-gray-500"> <Share2 size={16}/>{isSharing ? '共有中...' : '共有リンクを作成'} </button>
                </div>
                {sharedLink && ( <div className="bg-black/20 p-2 rounded-md flex items-center gap-2"> <input type="text" readOnly value={sharedLink} className="bg-slate-700 p-1 flex-grow rounded-sm" /> <button onClick={copyToClipboard} className="p-2 hover:bg-white/10 rounded-md"><Copy size={16}/></button> </div> )}
            </header>
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
                <div ref={tierListRef} className="flex flex-col flex-grow min-h-0 bg-slate-800 p-4 rounded-lg">
                    <main className="flex-grow space-y-2 overflow-y-auto custom-scrollbar pr-2"> {(activeList?.tiers || []).map(tierName => ( <TierContainer key={tierName} id={tierName} chars={(items[tierName] || []).map(getCharFromId)} onDeleteTier={handleDeleteTier} /> ))} </main>
                    <footer className="flex-shrink-0 mt-4 pt-4 border-t-2 border-slate-700"> <div className="h-48 overflow-y-auto custom-scrollbar pr-2"> <TierContainer id="unranked" chars={(items.unranked || []).map(getCharFromId)} onDeleteTier={() => {}}/> </div> </footer>
                </div>
                {createPortal( <DragOverlay> {activeCharacter ? <Character char={activeCharacter} /> : null} </DragOverlay>, document.body )}
            </DndContext>
            <AnimatePresence> {isAddTierModalOpen && ( <AddTierModal onClose={() => setIsAddTierModalOpen(false)} onAdd={handleAddNewTier} /> )} </AnimatePresence>
        </div>
    );
};

export default TierMakerScreen;