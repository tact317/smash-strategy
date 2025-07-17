import { useData } from '../contexts/DataContext';
import { useSettings } from '../contexts/SettingsContext';
import { useAudioSettings } from '../contexts/AudioSettingsContext';
import { useModal } from '../contexts/ModalContext';

// アプリ内の複数のContextにまたがるデータを一括で処理するためのカスタムフック
export const useBackupSystem = () => {
    // 必要なデータを各Contextから取得
    const dataContext = useData();
    const settingsContext = useSettings();
    const audioSettingsContext = useAudioSettings();
    const { showConfirm } = useModal();

    // 全データを書き出す関数
    const exportAllData = () => {
        const backupData = {
            // DataContextから取得するデータ
            data: {
                characters: dataContext.characters,
                commands: dataContext.commands,
                characterData: dataContext.characterData,
                quizzes: dataContext.quizzes,
                tierLists: dataContext.tierLists,
                activeTierListId: dataContext.activeTierListId,
                goals: dataContext.goals,
                replayNotes: dataContext.replayNotes,
                missionProgress: dataContext.missionProgress,
                unlockedItems: dataContext.unlockedItems,
            },
            // SettingsContextから取得するデータ
            settings: settingsContext.settings,
            // AudioSettingsContextから取得するデータ
            audioSettings: {
                settings: audioSettingsContext.settings,
                assignments: audioSettingsContext.assignments,
            }
        };
        
        const dataStr = JSON.stringify(backupData, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `smash-note-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        alert('全データのバックアップが完了しました。');
    };

    // ファイルから全データを読み込む関数
    const importAllData = (file) => {
        const reader = new FileReader();
        reader.onload = async (e) => {
            const confirmed = await showConfirm(
                "データのインポート",
                "現在の全データが、読み込んだファイルの内容で上書きされます。この操作は取り消せません。本当によろしいですか？"
            );

            if (!confirmed) return;

            try {
                const data = JSON.parse(e.target.result);
                if (!data.data || !data.settings || !data.audioSettings) {
                    throw new Error("無効なバックアップファイルです。");
                }

                // localStorageに直接書き込むことで、アプリ全体の状態を一括で更新する
                localStorage.setItem('smashAppCharacters', JSON.stringify(data.data.characters || []));
                localStorage.setItem('smashAppCommands', JSON.stringify(data.data.commands || []));
                localStorage.setItem('smashAppCharacterData', JSON.stringify(data.data.characterData || {}));
                localStorage.setItem('smashAppQuizzes', JSON.stringify(data.data.quizzes || []));
                localStorage.setItem('smashAppTierLists', JSON.stringify(data.data.tierLists || []));
                localStorage.setItem('smashAppActiveTierListId', JSON.stringify(data.data.activeTierListId || 'default'));
                localStorage.setItem('smashAppGoals', JSON.stringify(data.data.goals || []));
                localStorage.setItem('smashAppReplayNotes', JSON.stringify(data.data.replayNotes || {}));
                localStorage.setItem('smashAppMissionProgress', JSON.stringify(data.data.missionProgress || {}));
                localStorage.setItem('smashAppUnlockedItems', JSON.stringify(data.data.unlockedItems || []));
                localStorage.setItem('smashAppSettings', JSON.stringify(data.settings || {}));
                localStorage.setItem('smashAppAudioSettings', JSON.stringify(data.audioSettings.settings || {}));
                localStorage.setItem('smashAppAudioAssignments', JSON.stringify(data.audioSettings.assignments || {}));

                alert("データのインポートに成功しました。アプリを再起動します。");
                window.location.reload();

            } catch (error) {
                alert(`ファイルの読み込みまたはデータの復元に失敗しました: ${error.message}`);
            }
        };
        reader.readAsText(file);
    };

    return { exportAllData, importAllData };
};