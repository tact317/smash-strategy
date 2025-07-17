import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './QuizModal.css';
import { useUI } from '../contexts/UIContext';
import { useAudioSettings } from '../contexts/AudioSettingsContext';
import { usePlayerStats } from '../contexts/PlayerStatsContext';

const QuizModal = ({ quiz, onClose }) => {
  const { setCursorVariant } = useUI();
  const { settings } = useAudioSettings();
  const { isSeEnabled, seVolume } = settings;
  const { addPoints } = usePlayerStats();
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);
  const [showChallenger, setShowChallenger] = useState(true);

  const sounds = {
    start: useRef(null), correct: useRef(null), incorrect: useRef(null), challenger: useRef(null),
  };

  const playSound = useCallback((soundKey) => {
    if (isSeEnabled && sounds[soundKey].current) {
        sounds[soundKey].current.volume = seVolume;
        sounds[soundKey].current.currentTime = 0;
        sounds[soundKey].current.play().catch(e => {});
    }
  }, [isSeEnabled, seVolume, sounds]);

  useEffect(() => {
    playSound('challenger');
    const timer = setTimeout(() => {
      setShowChallenger(false);
      playSound('start');
    }, 2500);
    return () => clearTimeout(timer);
  }, [playSound]);

  const handleAnswerClick = (option) => {
    if (selectedAnswer) return;
    const correct = option === quiz.answer;
    setSelectedAnswer(option);
    setIsCorrect(correct);
    
    if (correct) {
      playSound('correct');
      addPoints(10);
      // 正解時の通知はaddPoints内からこちらに移動
      alert("正解！ 10ポイント獲得！");
    } else {
      playSound('incorrect');
    }
    
    setTimeout(() => onClose(correct), 2000);
  };
  
  const handleMouseEnter = () => setCursorVariant('default');
  const handleButtonMouseEnter = () => setCursorVariant('hover');

  return (
    <motion.div className="quiz-modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseEnter={handleMouseEnter}>
      <audio ref={sounds.start} src="/audio/quiz_start.mp3" preload="auto" />
      <audio ref={sounds.correct} src="/audio/quiz_correct.mp3" preload="auto" />
      <audio ref={sounds.incorrect} src="/audio/quiz_incorrect.mp3" preload="auto" />
      <audio ref={sounds.challenger} src="/audio/challenger_approaching.mp3" preload="auto" />
      <AnimatePresence>
        {showChallenger ? (
          <motion.div key="challenger" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 2 }} className="w-full h-full flex flex-col items-center justify-center">
            <motion.img src="/images/challenger_silhouette.png" alt="Challenger" className="max-w-[50%] max-h-[50%]" initial={{ scale: 3, opacity: 0 }} animate={{ scale: 1, opacity: 1, transition: { delay: 0.2, duration: 0.5 } }}/>
            <motion.h1 className="text-6xl font-extrabold mt-4 text-white" style={{ fontFamily: 'Impact, sans-serif' }} initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1, transition: { delay: 0.4, duration: 0.5 } }}>A NEW QUIZ APPROACHES!</motion.h1>
          </motion.div>
        ) : (
          <motion.div key="quiz" className="quiz-modal-content" initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ type: 'spring', stiffness: 100 }}>
            <h2 className="quiz-question">{quiz.question}</h2>
            <div className="quiz-options">
              {quiz.options.map((option, index) => (
                <button key={index} className="quiz-option-button" onClick={() => handleAnswerClick(option)} disabled={selectedAnswer !== null} onMouseEnter={handleButtonMouseEnter} onMouseLeave={handleMouseEnter}>{option}</button>
              ))}
            </div>
            {isCorrect !== null && ( <motion.div className={`quiz-feedback ${isCorrect ? 'feedback-correct' : 'feedback-incorrect'}`} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}>{isCorrect ? '正解！' : `不正解！ 正解は「${quiz.answer}」`}</motion.div> )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default QuizModal;