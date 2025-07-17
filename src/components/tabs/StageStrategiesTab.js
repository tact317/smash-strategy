// src/components/tabs/StageStrategiesTab.js (全文・エラー修正版)

import React from 'react';
import MatchupsTab from './MatchupsTab';

const StageStrategiesTab = ({ characterData, updateCharacterData }) => {
    // ★★★ ここが今回の修正点です ★★★
    // characterDataにstageStrategiesが存在しない場合でも、デフォルトの空配列を設定する
    const stageStrategies = characterData.stageStrategies || [];
    
    // MatchupsTabは汎用的なので、キーの名前を変換して再利用する
    const stageData = {
        matchups: stageStrategies.map(s => ({
            id: s.id,
            opponentName: s.stageName, // stageNameをopponentNameとして扱う
            notes: s.notes
        }))
    };

    const updateStageData = (path, newStages) => {
        // MatchupsTabから返ってくるデータは opponentName をキーにしているので、
        // 保存する前に stageName に戻す
        const convertedStages = newStages.map(s => ({
            id: s.id,
            stageName: s.opponentName, 
            notes: s.notes
        }));
        updateCharacterData(['stageStrategies'], convertedStages);
    };

    return (
        <MatchupsTab
            characterData={stageData}
            updateCharacterData={updateStageData}
        />
    );
};

export default StageStrategiesTab;