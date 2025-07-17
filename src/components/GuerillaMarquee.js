import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useAudioSettings } from '../contexts/AudioSettingsContext';
import './GuerillaMarquee.css';

const GuerillaMarquee = ({ onTriggerProblem }) => {
    const { settings } = useAudioSettings();
    const { isSeEnabled, seVolume } = settings;
    const audioRef = useRef(null);

    // このコンポーネントが表示された時に一度だけ実行
    useEffect(() => {
        const audioElement = audioRef.current;
        if (isSeEnabled && audioElement) {
            audioElement.volume = seVolume;
            audioElement.currentTime = 0;
            audioElement.play().catch(e => console.error("警告音の再生に失敗:", e));
        }

        // コンポーネントが消える（クリックされる）時に音を止める
        return () => {
            if (audioElement) {
                audioElement.pause();
                audioElement.currentTime = 0;
            }
        };
    }, [isSeEnabled, seVolume]); // isSeEnabledとseVolumeが変わった時も再評価

    const texts = [
        { text: "WARNING: A NEW CHALLENGER APPROACHES", count: 32 },
        { text: "INCOMING MESSAGE: PREPARE FOR BATTLE", count: 33 },
        { text: "SYSTEM ALERT: KNOWLEDGE CHECK INITIATED", count: 35 },
        { text: "EMERGENCY: ANSWER OR BE DEFEATED", count: 29 },
    ];

    const Marquee = ({ text, count }) => (
        <section className="guerilla-marquee" style={{ '--char-count': count }}>
            <div className="marquee--inner">
                <p>{text}</p>
                <p aria-hidden="true">{text}</p>
                <p aria-hidden="true">{text}</p>
                <p aria-hidden="true">{text}</p>
                <p aria-hidden="true">{text}</p>
                <p aria-hidden="true">{text}</p>
            </div>
        </section>
    );

    return (
        <motion.div
            className="guerilla-container"
            onClick={onTriggerProblem}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
        >
            <audio ref={audioRef} src="/audio/warning_siren.mp3" loop />
            {texts.map((item, index) => (
                <Marquee key={index} text={item.text} count={item.count} />
            ))}
        </motion.div>
    );
};

export default GuerillaMarquee;