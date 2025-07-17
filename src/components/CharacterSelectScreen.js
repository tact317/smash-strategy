import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sword, X, ChevronLeft, UserPlus, CirclePlus, Trash2, Palette, Edit, Loader, CheckCircle2 } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { useUI } from '../contexts/UIContext';
import { useModal } from '../contexts/ModalContext';
import ColorThief from 'colorthief';
import { DndContext, PointerSensor, useSensor, useSensors, closestCenter } from '@dnd-kit/core';
import { arrayMove, SortableContext, useSortable, rectSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const EditCharacterModal = ({ character, onSave, onCancel }) => {
    const [name, setName] = useState(character.name);
    const [color, setColor] = useState(character.color);
    const [icon, setIcon] = useState(character.icon);
    const handleSave = () => { onSave({ ...character, name, color, icon }); onCancel(); };
    return (
        <motion.div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="bg-slate-800 rounded-xl p-8 w-full max-w-md border border-yellow-500/30 shadow-2xl" initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
                <div className="flex justify-between items-center mb-6 border-b border-slate-700 pb-4"><h3 className="text-2xl font-bold text-white flex items-center gap-2"><Edit size={24} className="text-yellow-400" />キャラクター編集</h3><button onClick={onCancel} className="text-gray-400 hover:text-white p-2 rounded-full hover:bg-slate-700"><X size={28} /></button></div>
                <div className="space-y-6">
                    <div><label className="block text-sm font-medium text-gray-300 mb-2">キャラクター名</label><input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white" /></div>
                    <div><label className="block text-sm font-medium text-gray-300 mb-2">テーマカラー</label><input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="w-full h-12 p-1 bg-slate-700 border border-slate-600 rounded-lg cursor-pointer" /></div>
                    <div><label className="block text-sm font-medium text-gray-300 mb-2">アイコン画像</label><input type="text" value={icon} onChange={(e) => setIcon(e.target.value)} className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white" /></div>
                    <button onClick={handleSave} className="w-full bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white py-3 rounded-lg font-bold text-lg"><CheckCircle2 size={20} className="inline-block mr-2" />保存する</button>
                </div>
            </motion.div>
        </motion.div>
    );
};

const SortableCharacter = ({ character, onSelect, onDelete, onEdit }) => {
    const { setCursorVariant } = useUI();
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: character.id });
    const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1, };
    return (
        <motion.div ref={setNodeRef} style={style} {...attributes} {...listeners} className="group cursor-grab aspect-square relative touch-none" variants={{ hidden: { opacity: 0, scale: 0.8 }, visible: { opacity: 1, scale: 1 } }} exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.3 } }} onMouseEnter={() => setCursorVariant('hover')} onMouseLeave={() => setCursorVariant('default')} whileTap={{ cursor: 'grabbing' }}>
            <div onClick={() => onSelect(character)} className="w-full h-full rounded-lg flex flex-col items-center justify-end text-white font-bold shadow-lg group-hover:shadow-2xl border-2 border-transparent group-hover:border-white/80 transition-all duration-300 transform group-hover:scale-105 p-2 bg-no-repeat bg-cover bg-center cursor-pointer" style={{ backgroundImage: `linear-gradient(to top, ${character.color}A0 20%, transparent 70%), url(${character.icon ? `/images/${encodeURIComponent(character.icon)}` : ''})`, backgroundColor: '#222' }}>
                <span className="text-center text-sm shadow-black [text-shadow:_0_1px_2px_var(--tw-shadow-color)]">{character.name}</span>
            </div>
            <div className="absolute top-1 right-1 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={(e) => { e.stopPropagation(); onEdit(character); }} className="p-1 bg-black/50 rounded-full text-white/50 hover:text-white hover:bg-blue-500/80 cursor-pointer"><Edit size={16} /></button>
                <button onClick={(e) => { e.stopPropagation(); onDelete(character.id); }} className="p-1 bg-black/50 rounded-full text-white/50 hover:text-white hover:bg-red-500/80 cursor-pointer"><Trash2 size={16} /></button>
            </div>
        </motion.div>
    );
}

const AddCharacterModal = ({ onAdd, onCancel }) => {
    const [imageFiles, setImageFiles] = useState([]);
    const [selectedImages, setSelectedImages] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const { characters } = useData();
    useEffect(() => { const getImages = async () => { if (window.electronAPI) { const files = await window.electronAPI.getImageFileNames(); const existingIcons = new Set(characters.map(c => c.icon)); const availableFiles = files.filter(file => !existingIcons.has(file)); setImageFiles(availableFiles); } }; getImages(); }, [characters]);
    const toggleSelection = (fileName) => { setSelectedImages(prev => prev.includes(fileName) ? prev.filter(f => f !== fileName) : [...prev, fileName]); };
    const handleAddClick = async () => { if (selectedImages.length === 0) { alert('追加するキャラクターの画像を選択してください。'); return; } setIsLoading(true); await onAdd(selectedImages); setIsLoading(false); onCancel(); };
    return (
        <motion.div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="bg-slate-800 rounded-xl p-6 w-full max-w-4xl h-[80vh] flex flex-col border border-purple-500/30" initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
                {isLoading && ( <div className="absolute inset-0 bg-slate-800/80 flex flex-col items-center justify-center z-10"> <Loader className="animate-spin w-16 h-16 text-purple-400" /> <p className="mt-4 text-lg">キャラクターの色を分析中...</p> </div> )}
                <div className="flex justify-between items-center mb-4 flex-shrink-0"><h3 className="text-2xl font-bold text-white flex items-center gap-2"><CirclePlus size={24} className="text-purple-400" />画像からキャラクターを選択</h3><button onClick={onCancel} className="text-gray-400 hover:text-white p-2 rounded-full hover:bg-slate-700"><X size={28} /></button></div>
                <div className="flex-grow overflow-y-auto custom-scrollbar pr-2 mb-4"> {imageFiles.length > 0 ? ( <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-4"> {imageFiles.map(file => { const isSelected = selectedImages.includes(file); return ( <div key={file} className="relative aspect-square cursor-pointer group" onClick={() => toggleSelection(file)}> <img src={`/images/${encodeURIComponent(file)}`} alt={file} className={`w-full h-full object-contain rounded-md transition-all duration-200 ${isSelected ? 'bg-purple-500/50 scale-95' : 'bg-black/20 hover:bg-black/40'}`} /> {isSelected && ( <div className="absolute top-1 right-1 text-purple-400 bg-slate-900 rounded-full"> <CheckCircle2 size={24} /> </div> )} </div> ); })} </div> ) : ( <div className="flex items-center justify-center h-full text-white/50"> <p>追加できる画像が `public/images` フォルダにありません。</p> </div> )} </div>
                <div className="flex-shrink-0 flex justify-end"> <button onClick={handleAddClick} disabled={selectedImages.length === 0 || isLoading} className="px-6 py-3 bg-purple-600 rounded-md hover:bg-purple-700 disabled:bg-gray-500 disabled:cursor-not-allowed flex items-center justify-center gap-2"> <UserPlus size={18} /> {selectedImages.length}件のキャラクターを追加 </button> </div>
            </motion.div>
        </motion.div>
    );
};

const CharacterSelectScreen = ({ onSelect, onBack }) => {
  const { characters, setCharacters, handleAddMultipleCharacters, handleDeleteCharacter, handleRecalculateAllColors, handleUpdateCharacter } = useData();
  const { setCursorVariant } = useUI();
  const { showConfirm } = useModal();
  const [showAddModal, setShowAddModal] = useState(false);
  const [isRecalculating, setIsRecalculating] = useState(false);
  const [editingCharacter, setEditingCharacter] = useState(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const handleDragEnd = (event) => { const { active, over } = event; if (active.id !== over.id) { const oldIndex = characters.findIndex(c => c.id === active.id); const newIndex = characters.findIndex(c => c.id === over.id); setCharacters(arrayMove(characters, oldIndex, newIndex)); } };
  const handleAddBatch = async (files) => { const colorThief = new ColorThief(); const newCharactersPromises = files.map(file => new Promise((resolve) => { const name = file.replace(/\.(png|jpe?g|gif)$/i, ""); const imageUrl = `/images/${encodeURIComponent(file)}`; const img = new Image(); img.crossOrigin = "Anonymous"; img.src = imageUrl; img.onload = () => { try { const rgb = colorThief.getColor(img); const hexColor = `#${rgb.map(x => x.toString(16).padStart(2, '0')).join('')}`; resolve({ name, icon: file, color: hexColor }); } catch (e) { resolve({ name, icon: file, color: `#${Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')}` }); } }; img.onerror = () => { resolve({ name, icon: file, color: `#${Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')}` }); }; })); const newCharacters = await Promise.all(newCharactersPromises); handleAddMultipleCharacters(newCharacters); };

  const onRecalculateClick = async () => {
    const confirmed = await showConfirm("色の再スキャン", "全キャラクターの色をアイコン画像から再スキャンしますか？");
    if (confirmed) {
        setIsRecalculating(true);
        await handleRecalculateAllColors();
        setIsRecalculating(false);
    }
  };

  const onDeleteClick = async (characterId) => {
    const confirmed = await showConfirm("キャラクターの削除", "このキャラクターを削除しますか？関連データも全て失われます。");
    if (confirmed) {
        handleDeleteCharacter(characterId);
    }
  };

  return (
    <div className="w-screen h-screen bg-slate-900 flex flex-col text-white">
      <AnimatePresence> {isRecalculating && ( <motion.div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm flex flex-col items-center justify-center z-50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} > <Loader className="animate-spin w-16 h-16 text-purple-400" /> <p className="mt-4 text-lg">全キャラクターの色を再スキャン中...</p> </motion.div> )} </AnimatePresence>
      <header className="flex-shrink-0 bg-black/30 backdrop-blur-sm border-b border-white/10">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-3xl font-bold flex items-center gap-3"><Sword className="text-purple-400" />キャラクター選択</h1>
          <div className="flex gap-2">
            <button onClick={onRecalculateClick} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700"> <Palette size={20} />色の再スキャン </button>
            <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700"> <UserPlus size={20} />キャラ追加 </button>
            <button onClick={onBack} className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-white/10"> <ChevronLeft size={20} />ホーム </button>
          </div>
        </div>
      </header>
      <main className="flex-grow p-8 overflow-y-auto custom-scrollbar">
        {characters.length > 0 ? (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={characters} strategy={rectSortingStrategy}>
              <motion.div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4" variants={{ visible: { transition: { staggerChildren: 0.02 } } }} initial="hidden" animate="visible" >
                  {characters.map((character) => (
                    <SortableCharacter key={character.id} character={character} onSelect={onSelect} onDelete={onDeleteClick} onEdit={setEditingCharacter} />
                  ))}
              </motion.div>
            </SortableContext>
          </DndContext>
        ) : (
          <div className="text-center text-white/50 pt-16">
            <p className="text-2xl mb-4">まだキャラクターが登録されていません。</p>
            <p>右上の「キャラ追加」ボタンから、最初のキャラクターを登録してみましょう！</p>
          </div>
        )}
      </main>
      <AnimatePresence>
        {showAddModal && <AddCharacterModal onAdd={handleAddBatch} onCancel={() => setShowAddModal(false)} />}
        {editingCharacter && ( <EditCharacterModal character={editingCharacter} onSave={handleUpdateCharacter} onCancel={() => setEditingCharacter(null)} /> )}
      </AnimatePresence>
    </div>
  );
};

export default CharacterSelectScreen;