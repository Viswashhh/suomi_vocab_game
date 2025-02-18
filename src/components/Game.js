import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import FloatingWord from './FloatingWord';
import { vocabulary } from './vocabulary';

const GameContainer = styled.div`
  width: 100%;
  height: 80vh;
  position: relative;
  background: #f0f8ff;
  overflow: hidden;
`;

const MenuContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: 20px;
`;

const CategoryButton = styled.button`
  padding: 15px 30px;
  font-size: 18px;
  border: none;
  border-radius: 25px;
  background: #4a90e2;
  color: white;
  cursor: pointer;
  width: 250px;
  transition: transform 0.2s, background 0.2s;

  &:hover {
    background: #357abd;
    transform: scale(1.05);
  }
`;

const InputArea = styled.div`
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  text-align: center;
`;

const Input = styled.input`
  padding: 10px 20px;
  font-size: 18px;
  border-radius: 25px;
  border: 2px solid #4a90e2;
  width: 300px;
  &:focus {
    outline: none;
    border-color: #2d5a8e;
  }
`;

const ScoreDisplay = styled.div`
  position: fixed;
  top: 20px;
  right: 20px;
  font-size: 24px;
  font-weight: bold;
`;

const BackButton = styled.button`
  position: fixed;
  top: 20px;
  left: 20px;
  padding: 10px 20px;
  font-size: 16px;
  border: none;
  border-radius: 25px;
  background: #4a90e2;
  color: white;
  cursor: pointer;

  &:hover {
    background: #357abd;
  }
`;

const GameOverContainer = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: white;
  padding: 30px;
  border-radius: 15px;
  box-shadow: 0 0 20px rgba(0,0,0,0.2);
  max-height: 80vh;
  overflow-y: auto;
  width: 80%;
  max-width: 600px;
`;

const WordHistory = styled.div`
  margin-top: 20px;
  
  table {
    width: 100%;
    border-collapse: collapse;
    
    th, td {
      padding: 10px;
      border-bottom: 1px solid #eee;
      text-align: left;
    }
    
    th {
      background: #f5f5f5;
    }
  }
`;

function Game() {
  const [words, setWords] = useState([]);
  const [score, setScore] = useState(0);
  const [input, setInput] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [wordHistory, setWordHistory] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [currentWordStartTime, setCurrentWordStartTime] = useState(null);
  const wordTimeoutRef = useRef(null);

  useEffect(() => {
    if (gameStarted && selectedCategory && wordCount < 20) {
      spawnWord();
    }
  }, [gameStarted, selectedCategory, wordCount]);

  useEffect(() => {
    // Cleanup timeouts when component unmounts
    return () => {
      if (wordTimeoutRef.current) {
        clearTimeout(wordTimeoutRef.current);
      }
    };
  }, []);

  const spawnWord = () => {
    // Clear any existing timeout
    if (wordTimeoutRef.current) {
      clearTimeout(wordTimeoutRef.current);
    }

    const categoryWords = vocabulary[selectedCategory];
    const randomWord = categoryWords[Math.floor(Math.random() * categoryWords.length)];
    const newWord = {
      id: Date.now(),
      ...randomWord,
      x: Math.random() * (window.innerWidth - 100),
      y: -50,
      missed: false
    };

    setWords([newWord]);
    setCurrentWordStartTime(Date.now());

    // Set exact 10-second timeout
    wordTimeoutRef.current = setTimeout(() => {
      setWordHistory(prev => [...prev, { ...newWord, missed: true }]);
      setWords([]);
      setWordCount(prev => prev + 1);
      
      // Check if we should continue or end game
      if (wordCount < 19) { // Less than 19 because we're about to increment
        spawnWord();
      } else {
        setGameOver(true);
      }
    }, 10000);
  };

  const handleWordComplete = (wordId) => {
    // Clear the timeout for the current word
    if (wordTimeoutRef.current) {
      clearTimeout(wordTimeoutRef.current);
    }

    const completedWord = words[0];
    setWords([]);
    setScore(prevScore => prevScore + 1);
    setWordHistory(prev => [...prev, { ...completedWord, missed: false }]);
    setWordCount(prev => prev + 1);
    
    // Check if we should continue or end game
    if (wordCount < 19) { // Less than 19 because we're about to increment
      spawnWord();
    } else {
      setGameOver(true);
    }
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && words.length > 0) {
      const matchedWord = words[0];
      if (matchedWord.word.toLowerCase() === input.toLowerCase()) {
        handleWordComplete(matchedWord.id);
      }
      setInput('');
    }
  };

  const startGame = (category) => {
    setSelectedCategory(category);
    setGameStarted(true);
    setScore(0);
    setWords([]);
    setWordHistory([]);
    setWordCount(0);
    setGameOver(false);
  };

  const returnToMenu = () => {
    clearTimeout(wordTimeoutRef.current);
    setGameStarted(false);
    setSelectedCategory(null);
    setScore(0);
    setWords([]);
    setWordHistory([]);
    setWordCount(0);
    setGameOver(false);
  };

  if (gameOver) {
    return (
      <GameContainer>
        <GameOverContainer>
          <h2>Game Over!</h2>
          <h3>Final Score: {score} / 20</h3>
          <WordHistory>
            <table>
              <thead>
                <tr>
                  <th>English</th>
                  <th>Finnish</th>
                  <th>Result</th>
                </tr>
              </thead>
              <tbody>
                {wordHistory.map((word, index) => (
                  <tr key={index}>
                    <td>{word.translation}</td>
                    <td>{word.word}</td>
                    <td>{word.missed ? '❌ Missed' : '✅ Correct'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </WordHistory>
          <CategoryButton onClick={returnToMenu} style={{ marginTop: '20px' }}>
            Return to Menu
          </CategoryButton>
        </GameOverContainer>
      </GameContainer>
    );
  }

  if (!gameStarted) {
    return (
      <GameContainer>
        <MenuContainer>
          <h1>Select a Category</h1>
          {Object.keys(vocabulary).map(category => (
            <CategoryButton 
              key={category}
              onClick={() => startGame(category)}
            >
              {category}
            </CategoryButton>
          ))}
        </MenuContainer>
      </GameContainer>
    );
  }

  return (
    <GameContainer>
      <BackButton onClick={returnToMenu}>← Menu</BackButton>
      <ScoreDisplay>Score: {score}</ScoreDisplay>
      {words.map(word => (
        <FloatingWord
          key={word.id}
          id={word.id}
          finnish={word.word}
          english={word.translation}
          initialX={word.x}
          initialY={word.y}
          onComplete={handleWordComplete}
        />
      ))}
      <InputArea>
        <Input
          type="text"
          value={input}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          placeholder="Type the Finnish word..."
          autoFocus
        />
      </InputArea>
    </GameContainer>
  );
}

export default Game;