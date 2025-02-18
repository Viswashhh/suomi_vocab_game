import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';

const WordBubble = styled(motion.div)`
  position: absolute;
  padding: 10px 20px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  cursor: default;
  user-select: none;
  font-size: 1.2em;
`;

const WordContent = styled.div`
  text-align: center;
`;

const Translation = styled.span`
  font-size: 0.8em;
  color: #666;
  margin-top: 4px;
`;

const Timer = styled.div`
  position: absolute;
  top: -20px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 12px;
  color: #666;
`;

function FloatingWord({ id, finnish, english, initialX, initialY, onComplete }) {
  const [position, setPosition] = useState({ x: initialX, y: initialY });
  const [timeLeft, setTimeLeft] = useState(10);
  
  useEffect(() => {
    const startTime = Date.now();
    const totalDuration = 10000; // 10 seconds in milliseconds
    
    // Update position smoothly
    const fallInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / totalDuration, 1);
      
      setPosition(prev => ({
        ...prev,
        y: initialY + (window.innerHeight * 0.8 * progress) // Move 80% down screen over 10 seconds
      }));
    }, 16); // ~60fps for smooth animation

    // Update timer every second
    const timerInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(10 - Math.floor(elapsed / 1000), 0);
      setTimeLeft(remaining);
    }, 1000);

    return () => {
      clearInterval(fallInterval);
      clearInterval(timerInterval);
    };
  }, [initialY]);

  return (
    <AnimatePresence>
      <WordBubble
        id={`word-${id}`}
        initial={{ x: position.x, y: position.y, scale: 0 }}
        animate={{ 
          x: position.x,
          y: position.y,
          scale: 1,
          transition: { duration: 0.5 }
        }}
        exit={{ 
          scale: 0,
          opacity: 0,
          transition: { duration: 0.5 }
        }}
        whileHover={{ scale: 1.1 }}
      >
        <Timer>{timeLeft}s</Timer>
        <WordContent>
          {english}
        </WordContent>
      </WordBubble>
    </AnimatePresence>
  );
}

export default FloatingWord;