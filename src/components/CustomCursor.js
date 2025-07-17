// src/components/CustomCursor.js (全文)

import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useUI } from '../contexts/UIContext';

const CustomCursor = () => {
  const { cursorVariant } = useUI();
  const cursorRef = useRef(null);

  useEffect(() => {
    const onMouseMove = (event) => {
      if (cursorRef.current) {
        cursorRef.current.style.setProperty('--mouse-x', `${event.clientX}px`);
        cursorRef.current.style.setProperty('--mouse-y', `${event.clientY}px`);
      }
    };
    window.addEventListener('mousemove', onMouseMove);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
    };
  }, []);

  const variants = {
    default: {
      opacity: 1,
      scale: 1,
      rotate: -45,
    },
    hover: {
      opacity: 1,
      scale: 1.2,
      rotate: 0,
    },
  };

  return (
    <motion.div
      ref={cursorRef}
      className="pointer-events-none fixed z-[9999]"
      style={{
        top: 'var(--mouse-y, 0px)',
        left: 'var(--mouse-x, 0px)',
        translateX: '-10px',
        translateY: '-10px',
      }}
      variants={variants}
      animate={cursorVariant}
      transition={{
        type: 'spring',
        stiffness: 800,
        damping: 40,
      }}
    >
      <svg
        width="48"
        height="48"
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          filter: `drop-shadow(0 0 8px rgba(107, 209, 251, 0.7))`,
        }}
      >
        <path
          d="M17.8995 17.8995L33.9411 14.0589L30.1005 30.1005L24 24L17.8995 17.8995Z"
          stroke="#6BD1FB"
          strokeWidth="2"
          strokeLinejoin="round"
          fill="#1D2B3A"
          fillOpacity="0.8"
        />
      </svg>
    </motion.div>
  );
};

export default CustomCursor;