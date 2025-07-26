import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { loadFromLocalStorage, saveToLocalStorage } from '../utils';
import { missions } from '../data/missions';
import { collectionItems } from '../data/collection';
import { db } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';
import ColorThief from 'colorthief';

const DataContext = createContext();
export const useData = () => useContext(DataContext);

const getInitialMissionProgress = () => {
    const progress = {};
    for (const missionId in missions) {
        progress[missionId] = { current: 0, completed: false };
    }
    return progress;
};
const getInitialUnlockedItems = () => {
    const unlocked = [];
    for (const itemId in collectionItems) {
        if (collectionItems[itemId].unlockedByDefault) {
            unlocked.push(itemId);
        }
    }
    return unlocked;
};

export const DataProvider = ({ children }) => {
    const [characters, setCharacters] = useState(() => loadFromLocalStorage('smashAppCharacters', []));
    const [commands, setCommands] = useState(() => loadFromLocalStorage('smashAppCommands', [ { id: 1, name: '弱攻撃', command: 'A', category: '地上技' } ]));
    const [characterData, setCharacterData] = useState(() => loadFromLocalStorage('smashAppCharacterData', {}));
    const [quizzes, setQuizzes] = useState(() => loadFromLocalStorage('smashAppQuizzes', []));
    const [tierLists, setTierLists] = useState(() => loadFromLocalStorage('smashAppTierLists', [{ id: 'default', title: 'マイキャラランク', tiers: ['S', 'A', 'B', 'C'], characterPlacements: { S: [], A: [], B: [], C: [], unranked: [] }}]));
    const [activeTierListId, setActiveTierListId] = useState(() => loadFromLocalStorage('smashAppActiveTierListId', 'default'));
    const [goals, setGoals] = useState(() => loadFromLocalStorage('smashAppGoals', []));
    const [replayNotes, setReplayNotes] = useState(() => loadFromLocalStorage('smashAppReplayNotes', {}));
    const [missionProgress, setMissionProgress] = useState(() => loadFromLocalStorage('smashAppMissionProgress', getInitialMissionProgress()));
    const [unlockedItems, setUnlockedItems] = useState(() => loadFromLocalStorage('smashAppUnlockedItems', getInitialUnlockedItems()));

    useEffect(() => { saveToLocalStorage('smashAppCharacters', characters); }, [characters]);
    useEffect(() => { saveToLocalStorage('smashAppCommands', commands); }, [commands]);
    useEffect(() => { saveToLocalStorage('smashAppCharacterData', characterData); }, [characterData]);
    useEffect(() => { saveToLocalStorage('smashAppQuizzes', quizzes); }, [quizzes]);
    useEffect(() => { saveToLocalStorage('smashAppTierLists', tierLists); }, [tierLists]);
    useEffect(() => { saveToLocalStorage('smashAppActiveTierListId', activeTierListId); }, [activeTierListId]);
    useEffect(() => { saveToLocalStorage('smashAppGoals', goals); }, [goals]);
    useEffect(() => { saveToLocalStorage('smashAppReplayNotes', replayNotes); }, [replayNotes]);
    useEffect(() => { saveToLocalStorage('smashAppMissionProgress', missionProgress); }, [missionProgress]);
    useEffect(() => { saveToLocalStorage('smashAppUnlockedItems', unlockedItems); }, [unlockedItems]);

    useEffect(() => {
        let needsUpdate = false;
        const newData = { ...characterData };
        characters.forEach(char => {
          if (!newData[char.id] || !newData[char.id].records?.matches) {
            needsUpdate = true;
            newData[char.id] = {
              ...newData[char.id],
              combos: newData[char.id]?.combos || { low: [], mid: [], high: [] },
              gameplan: newData[char.id]?.gameplan || { early: '', mid: '', kill: '' },
              matchups: newData[char.id]?.matchups || [],
              recovery: newData[char.id]?.recovery || { patterns: '', edgeguarding: '' },
              frameData: newData[char.id]?.frameData || [],
              stageStrategies: newData[char.id]?.stageStrategies || [],
              records: { notes: newData[char.id]?.records?.notes || '', matches: newData[char.id]?.records?.matches || [] },
              videoLinks: newData[char.id]?.videoLinks || [],
              practiceList: newData[char.id]?.practiceList || [],
            };
          }
        });
        if (needsUpdate) setCharacterData(newData);
    }, [characters]);

    const unlockItem = useCallback((itemId) => {
        if (!itemId || unlockedItems.includes(itemId)) return;
        setUnlockedItems(prev => {
            const newUnlocked = [...prev, itemId];
            const item = collectionItems[itemId];
            if(item) { alert(`新しいコレクションをアンロックしました: ${item.name}`); }
            return newUnlocked;
        });
    }, [unlockedItems]);

    const updateAllMissionProgress = useCallback(() => {
        const totalNotes = Object.values(characterData).reduce((sum, data) => sum + (data.matchups?.length || 0), 0);
        const totalWins = Object.values(characterData).reduce((sum, data) => {
            const wins = (data.records?.matches || []).filter(m => m.result === 'win').length;
            return sum + wins;
        }, 0);
        const characterCount = characters.length;
        const tierListCount = tierLists.length;
        setMissionProgress(prevProgress => {
            const newProgress = JSON.parse(JSON.stringify(prevProgress));
            let changed = false;
            for (const missionId in missions) {
                if (!newProgress[missionId]) { newProgress[missionId] = { current: 0, completed: false }; }
                if (newProgress[missionId].completed) continue;
                let currentValue;
                const mission = missions[missionId];
                switch (mission.type) {
                    case 'NOTE_COUNT_TOTAL': currentValue = totalNotes; break;
                    case 'WIN_COUNT_TOTAL': currentValue = totalWins; break;
                    case 'CHARACTER_COUNT': currentValue = characterCount; break;
                    case 'TIER_LIST_COUNT': currentValue = tierListCount; break;
                    default: break;
                }
                if (currentValue !== undefined && newProgress[missionId].current !== currentValue) { newProgress[missionId].current = currentValue; changed = true; }
                if (newProgress[missionId].current >= mission.goal) { newProgress[missionId].completed = true; unlockItem(mission.reward.id); changed = true; }
            }
            return changed ? newProgress : prevProgress;
        });
    }, [characterData, characters, tierLists, unlockItem]);

    useEffect(() => {
        updateAllMissionProgress();
    }, [characterData, tierLists, characters, updateAllMissionProgress]);

    const exportAllData = () => {
        return {
            characters, commands, characterData, quizzes, tierLists,
            activeTierListId, goals, replayNotes, missionProgress, unlockedItems,
        };
    };

    const importAllData = (data) => {
        try {
            if (!data || !data.characters || !data.characterData) {
                throw new Error("無効なデータファイルです。");
            }
            setCharacters(data.characters || []);
            setCommands(data.commands || []);
            setCharacterData(data.characterData || {});
            setQuizzes(data.quizzes || []);
            setTierLists(data.tierLists || []);
            setActiveTierListId(data.activeTierListId || 'default');
            setGoals(data.goals || []);
            setReplayNotes(data.replayNotes || {});
            setMissionProgress(data.missionProgress || getInitialMissionProgress());
            setUnlockedItems(data.unlockedItems || getInitialUnlockedItems());
            return true;
        } catch (error) {
            console.error("データのインポートに失敗しました:", error);
            return false;
        }
    };
    
    const shareTierList = async (tierListData) => {
        try {
            const docRef = await addDoc(collection(db, "sharedTierLists"), { ...tierListData, createdAt: new Date() });
            return docRef.id;
        } catch (e) {
            console.error("Error adding document: ", e);
            alert("共有に失敗しました。");
            return null;
        }
    };
    const addMatchRecord = (characterId, opponentName, result) => {
        setCharacterData(prev => {
            const newMatch = { id: Date.now(), opponent: opponentName, result };
            const currentCharacter = prev[characterId] || {};
            const currentRecords = currentCharacter.records || {};
            const currentMatches = currentRecords.matches || [];

            return {
                ...prev,
                [characterId]: {
                    ...currentCharacter,
                    records: { ...currentRecords, matches: [newMatch, ...currentMatches] }
                }
            };
        });
    };
    const deleteMatchRecord = (characterId, matchId) => {
        setCharacterData(prev => {
            const currentCharacter = prev[characterId];
            const updatedMatches = (currentCharacter?.records?.matches || []).filter(m => m.id !== matchId);
            return { ...prev, [characterId]: { ...currentCharacter, records: { ...currentCharacter.records, matches: updatedMatches } } };
        });
    };
    const handleAddMultipleCharacters = (newCharInfos) => { const time = Date.now(); const existingNames = new Set(characters.map(c => c.name)); const trulyNewCharacters = newCharInfos.filter(info => !existingNames.has(info.name)).map((info, index) => ({ ...info, id: `${time}-${index}` })); if (trulyNewCharacters.length > 0) { setCharacters(prev => [...prev, ...trulyNewCharacters]); } };
    const handleDeleteCharacter = (characterId) => { setCharacters(prev => prev.filter(c => c.id !== characterId)); setCharacterData(prev => { const newData = {...prev}; delete newData[characterId]; return newData; }); setTierLists(prevLists => prevLists.map(list => { const newPlacements = { ...list.characterPlacements }; Object.keys(newPlacements).forEach(tier => { newPlacements[tier] = newPlacements[tier].filter(id => id !== characterId); }); return { ...list, characterPlacements: newPlacements }; })); };
    const handleAddCommand = (newCommandInfo) => { setCommands(prev => [...prev, { ...newCommandInfo, id: Date.now() }]); };
    const handleDeleteCommand = (commandId) => { setCommands(prev => prev.filter(cmd => cmd.id !== commandId)); };
    const handleUpdateCharacter = (updatedCharacter) => { setCharacters(prev => prev.map(c => c.id === updatedCharacter.id ? updatedCharacter : c)); };
    const handleUpdateCommand = (updatedCommand) => { setCommands(prev => prev.map(cmd => cmd.id === updatedCommand.id ? updatedCommand : cmd)); };
    const handleRecalculateAllColors = async () => { const colorThief = new ColorThief(); const updatedCharactersPromises = characters.map(character => new Promise((resolve) => { const imageUrl = `/images/${encodeURIComponent(character.icon)}`; const img = new Image(); img.crossOrigin = "Anonymous"; img.src = imageUrl; img.onload = () => { try { const rgb = colorThief.getColor(img); const hexColor = `#${rgb.map(x => x.toString(16).padStart(2, '0')).join('')}`; resolve({ ...character, color: hexColor }); } catch (e) { resolve(character); } }; img.onerror = () => { resolve(character); }; })); const updatedCharacters = await Promise.all(updatedCharactersPromises); setCharacters(updatedCharacters); return true; };
    const addGoal = (text) => { const newGoal = { id: Date.now(), text, completed: false }; setGoals(prev => [...prev, newGoal]); };
    const toggleGoalStatus = (id) => { setGoals(prev => prev.map(goal => goal.id === id ? { ...goal, completed: !goal.completed } : goal)); };
    const deleteGoal = (id) => { setGoals(prev => prev.filter(goal => goal.id !== id)); };
    const addReplay = (characterId, videoUrl) => { const newReplay = { id: Date.now(), videoUrl, notes: [] }; setReplayNotes(prev => ({ ...prev, [characterId]: [...(prev[characterId] || []), newReplay] })); };
    const deleteReplay = (characterId, replayId) => { setReplayNotes(prev => { const newReplays = (prev[characterId] || []).filter(replay => replay.id !== replayId); return { ...prev, [characterId]: newReplays }; }); };
    const addNoteToReplay = (characterId, replayId, note) => { setReplayNotes(prev => { const newReplays = (prev[characterId] || []).map(replay => { if (replay.id === replayId) { return { ...replay, notes: [...replay.notes, { ...note, id: Date.now() }] }; } return replay; }); return { ...prev, [characterId]: newReplays }; }); };
    const updateNoteInReplay = (characterId, replayId, noteId, newText) => { setReplayNotes(prev => { const newReplays = (prev[characterId] || []).map(replay => { if (replay.id === replayId) { const updatedNotes = replay.notes.map(note => note.id === noteId ? { ...note, text: newText } : note); return { ...replay, notes: updatedNotes }; } return replay; }); return { ...prev, [characterId]: newReplays }; }); };
    const deleteNoteFromReplay = (characterId, replayId, noteId) => { setReplayNotes(prev => { const newReplays = (prev[characterId] || []).map(replay => { if (replay.id === replayId) { const updatedNotes = replay.notes.filter(note => note.id !== noteId); return { ...replay, notes: updatedNotes }; } return replay; }); return { ...prev, [characterId]: newReplays }; }); };
    const generatePersonalQuiz = () => { /* ... */ };

    const value = {
        characters, setCharacters, commands, setCommands, characterData, setCharacterData, quizzes, setQuizzes,
        tierLists, setTierLists, activeTierListId, setActiveTierListId, goals, addGoal, toggleGoalStatus, deleteGoal,
        replayNotes, addReplay, deleteReplay, addNoteToReplay, updateNoteInReplay, deleteNoteFromReplay,
        handleAddMultipleCharacters, handleDeleteCharacter, handleAddCommand, handleDeleteCommand,
        handleRecalculateAllColors, handleUpdateCharacter, handleUpdateCommand,
        missionProgress, unlockedItems,
        shareTierList,
        addMatchRecord, 
        deleteMatchRecord,
        exportAllData,
        importAllData,
        generatePersonalQuiz,
        unlockItem,
    };

    return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};