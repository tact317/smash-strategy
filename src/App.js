import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useData } from './contexts/DataContext';
import { useSettings } from './contexts/SettingsContext';
import { useUI } from './contexts/UIContext';
import { ModalProvider } from './contexts/ModalContext';
import { useAuth } from './contexts/AuthContext';

import HomeScreen from './components/HomeScreen';
import SplashScreen from './components/SplashScreen';
import ShatterScreen from './components/ShatterScreen';
import CustomCursor from './components/CustomCursor';
import ShaderBackground from './components/ShaderBackground';
import GuerillaMarquee from './components/GuerillaMarquee';
import QuizModal from './components/QuizModal';
import SettingsPage from './components/SettingsPage';
import CharacterSelectScreen from './components/CharacterSelectScreen';
import TacticsNoteScreen from './components/TacticsNoteScreen';
import MissionsScreen from './components/MissionsScreen';
import CollectionPage from './components/CollectionPage';
import CollectionMenuScreen from './components/CollectionMenuScreen';
import TierMakerScreen from './components/TierMakerScreen';
import SpiritsMenuScreen from './components/SpiritsMenuScreen';
import ChallengeGeneratorScreen from './components/ChallengeGeneratorScreen';
import GoalTrackerScreen from './components/GoalTrackerScreen';
import NemesisTrackerScreen from './components/NemesisTrackerScreen';
import AnotherGameMenuScreen from './components/AnotherGameMenuScreen';
import CharacterComparisonScreen from './components/CharacterComparisonScreen';
import ReplayFeatureScreen from './components/ReplayFeatureScreen';
import AudioManager from './components/AudioManager';
import OnlineMenuScreen from './components/OnlineMenuScreen';
import AuthScreen from './components/AuthScreen';
import ProfileScreen from './components/ProfileScreen';
import FindFriendScreen from './components/FindFriendScreen';
import FriendProfileScreen from './components/FriendProfileScreen';

const commandCategories = ['地上技', 'スマッシュ攻撃', '必殺技', '空中技', 'つかみ', 'その他'];

const MainApp = () => {
  const { quizzes, generatePersonalQuiz } = useData();
  const { settings } = useSettings();
  const { guerillaStep, setGuerillaStep, currentQuiz, setCurrentQuiz } = useUI();
  const [currentView, setCurrentView] = useState('splash');
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [viewProps, setViewProps] = useState(null);

  useEffect(() => {
    let timer;
    if (settings.isGuerillaEnabled && guerillaStep === 'idle') {
      timer = setTimeout(() => {
        setGuerillaStep('marquee');
      }, settings.guerillaFrequency);
    }
    return () => clearTimeout(timer);
  }, [settings.isGuerillaEnabled, settings.guerillaFrequency, guerillaStep, setGuerillaStep]);

  const handleSelectCharacter = (character) => {
    setSelectedCharacter(character);
    setCurrentView('tactics-note');
  };
  
  const handleMarqueeClick = () => {
    const allQuizzes = [...quizzes];
    const personalQuiz = generatePersonalQuiz();
    if (personalQuiz) {
        allQuizzes.push(personalQuiz);
    }
    if (allQuizzes.length > 0) {
      setCurrentQuiz(allQuizzes[Math.floor(Math.random() * allQuizzes.length)]);
      setGuerillaStep('quiz');
    } else {
      setGuerillaStep('idle');
    }
  };

  const handleNavigate = (view, props = null) => {
    setViewProps(props);
    setCurrentView(view);
  };

  const renderCurrentView = () => {
    switch(currentView) {
      case 'splash': return <SplashScreen onAnimationComplete={() => handleNavigate('shatter')} />;
      case 'shatter': return <ShatterScreen onTransitionEnd={() => handleNavigate('home')} />;
      case 'home': return <HomeScreen onNavigate={handleNavigate} />;
      case 'character-select': return <CharacterSelectScreen onSelect={handleSelectCharacter} onBack={() => handleNavigate('home')} />;
      case 'tactics-note':
        return <TacticsNoteScreen 
                  character={selectedCharacter}
                  onBack={() => { setSelectedCharacter(null); handleNavigate('character-select'); }} 
                />;
      case 'settings':
        return <SettingsPage onNavigate={handleNavigate} onClose={() => handleNavigate('home')} commandCategories={commandCategories} />;
      case 'profile':
        return <ProfileScreen onNavigate={handleNavigate} onBack={() => handleNavigate('settings')} />;
      case 'find-friend':
        return <FindFriendScreen onBack={() => handleNavigate('profile')} />;
      case 'friend-profile':
        return <FriendProfileScreen {...viewProps} onBack={() => handleNavigate('profile')} />;
      case 'collection':
        return <CollectionMenuScreen onNavigate={handleNavigate} onBack={() => handleNavigate('home')} />;
      case 'missions':
        return <MissionsScreen onBack={() => handleNavigate('collection')} />;
      case 'stats':
        return <CollectionPage onClose={() => handleNavigate('collection')} />;
      case 'another-game':
        return <AnotherGameMenuScreen onNavigate={handleNavigate} onBack={() => handleNavigate('home')} />;
      case 'character-comparison':
        return <CharacterComparisonScreen onBack={() => handleNavigate('another-game')} />;
      case 'tier-maker':
        return <TierMakerScreen onBack={() => handleNavigate('another-game')} />;
      case 'spirits':
        return <SpiritsMenuScreen onNavigate={handleNavigate} onBack={() => handleNavigate('home')} />;
      case 'challenge-generator':
        return <ChallengeGeneratorScreen onBack={() => handleNavigate('spirits')} />;
      case 'goal-tracker':
        return <GoalTrackerScreen onBack={() => handleNavigate('spirits')} />;
      case 'nemesis-tracker':
        return <NemesisTrackerScreen onBack={() => handleNavigate('spirits')} />;
      case 'online':
        return <OnlineMenuScreen onNavigate={handleNavigate} onBack={() => handleNavigate('home')} />;
      case 'replay-feature':
        return <ReplayFeatureScreen onBack={() => handleNavigate('online')} />;
        
      default: return <div>{currentView} 画面 (作成中)</div>;
    }
  };

  const showCustomCursor = currentView !== 'splash' && currentView !== 'shatter';

  return (
    <main className={`relative min-h-screen text-white flex flex-col items-center justify-center overflow-hidden bg-black ${showCustomCursor ? 'cursor-none' : 'cursor-default'}`}>
      <AudioManager currentView={currentView} guerillaStep={guerillaStep} />
      {(currentView !== 'splash' && currentView !== 'shatter') && <ShaderBackground />}
      {showCustomCursor && <CustomCursor />}
      
      <div className="relative z-10 w-full h-full flex items-center justify-center">
        <AnimatePresence mode="wait">
            <motion.div key={currentView} className="w-full h-full" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}>
                {renderCurrentView()}
            </motion.div>
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {guerillaStep === 'marquee' && <GuerillaMarquee onTriggerProblem={handleMarqueeClick} />}
        {guerillaStep === 'quiz' && currentQuiz && <QuizModal quiz={currentQuiz} onClose={() => { setGuerillaStep('idle'); setCurrentQuiz(null); }} />}
      </AnimatePresence>
    </main>
  );
}

const App = () => {
    const { currentUser } = useAuth();
  
    return (
        <ModalProvider>
            {currentUser ? <MainApp /> : <AuthScreen />}
        </ModalProvider>
    );
};

export default App;