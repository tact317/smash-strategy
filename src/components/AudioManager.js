import React, { useRef, useEffect, useMemo } from 'react';
import { useAudioSettings } from '../contexts/AudioSettingsContext';
import { collectionItems } from '../data/collection';

// 汎用的なフェード処理関数
const fade = (element, targetVolume, duration, onComplete) => {
    if (element.fadeInterval) {
        clearInterval(element.fadeInterval);
    }
    const startVolume = element.volume;
    const intervalTime = 25;
    const step = (targetVolume - startVolume) / (duration / intervalTime);
    if (step === 0) {
        if (onComplete) onComplete();
        return;
    }
    element.fadeInterval = setInterval(() => {
        const newVolume = element.volume + step;
        if ((step > 0 && newVolume >= targetVolume) || (step < 0 && newVolume <= targetVolume)) {
            element.volume = targetVolume;
            clearInterval(element.fadeInterval);
            element.fadeInterval = null;
            if (targetVolume === 0) {
                element.pause();
            }
            if (onComplete) onComplete();
        } else {
            element.volume = newVolume;
        }
    }, intervalTime);
};

const AudioManager = ({ currentView }) => {
    const { settings, assignments } = useAudioSettings();
    const { isBgmEnabled, bgmVolume } = settings;
    const audioRefs = useRef({});

    // ★★★ ここが修正点です ★★★
    // どの画面でどの設定を使うかの対応表を、useEffectの外に定義します
    const viewToBgmAssignmentKey = useMemo(() => ({
        splash: 'bgm_splash',
        shatter: 'bgm_splash',
        home: 'bgm_home',
    }), []);

    useEffect(() => {
        const assignmentKey = viewToBgmAssignmentKey[currentView];
        const nextBgmId = assignments[assignmentKey];

        Object.values(collectionItems).filter(item => item.type === 'bgm').forEach(item => {
            const audioElement = audioRefs.current[item.id];
            if (!audioElement) return;

            if (!isBgmEnabled) {
                fade(audioElement, 0, 300, () => audioElement.pause());
                return;
            }

            if (item.id === nextBgmId) {
                // collectionItemsに基本音量がない場合を考慮
                const baseVolume = item.volume || 0.5;
                const targetVolume = baseVolume * bgmVolume;
                audioElement.play().catch(e => {});
                fade(audioElement, targetVolume, 500);
            } else {
                fade(audioElement, 0, 500, () => {
                    audioElement.pause();
                    audioElement.currentTime = 0;
                });
            }
        });
    }, [currentView, isBgmEnabled, bgmVolume, assignments, viewToBgmAssignmentKey]);

    return (
        <>
            {Object.values(collectionItems).filter(item => item.type === 'bgm').map(item => (
                <audio key={item.id} ref={el => audioRefs.current[item.id] = el} src={item.source} loop />
            ))}
        </>
    );
};

export default AudioManager;