// src/components/SplashScreen.js (最終版)

import React, { useEffect, useRef } from 'react';
import { gsap, Power4 } from 'gsap';
import TitleSvg from './TitleSvg';
import './SplashScreen.css';

const SplashScreen = ({ onAnimationComplete }) => {
  const figureRef = useRef(null);

  useEffect(() => {
    if (!figureRef.current) return;
    const figureElement = figureRef.current;

    const tl = gsap.timeline({
      onComplete: () => {
        // SVGが完成後、2秒待ってからフェードアウトし、次の画面へ
        gsap.to(figureElement, {
          duration: 0.8,
          autoAlpha: 0,
          delay: 2,
          ease: 'power2.inOut',
          onComplete: onAnimationComplete
        });
      }
    });
    
    const paths = figureElement.querySelectorAll('svg > *');
    const getRandom = (min, max) => Math.random() * (max - min) + min;

    gsap.set(paths, {
      x: () => getRandom(-500, 500), y: () => getRandom(-500, 500),
      rotation: () => getRandom(-720, 720), scale: 0, opacity: 0,
    });

    tl.to(paths, {
      duration: 1.5, x: 0, y: 0, opacity: 1, scale: 1, rotation: 0,
      ease: Power4.easeInOut, stagger: 0.015,
    });

    return () => {
      tl.kill();
    };
  }, [onAnimationComplete]);

  return <TitleSvg ref={figureRef} />;
};

export default SplashScreen;
