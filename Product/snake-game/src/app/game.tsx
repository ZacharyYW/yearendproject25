"use client";
import React, { useEffect, useRef, useState } from 'react';

type Coordinate = [number, number];

const BOARD_SIZE: number = 20;
const INITIAL_SNAKE: Coordinate[] = [[0, 0]];
const INITIAL_DIRECTION: Coordinate = [0, 1];

function App() {
  const [snake, setSnake] = useState<Coordinate[]>(INITIAL_SNAKE);
  const [direction, setDirection] = useState<Coordinate>(INITIAL_DIRECTION);
  const [food, setFood] = useState<Coordinate>(generateFood(INITIAL_SNAKE));
  const [gameOver, setGameOver] = useState<boolean>(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  function generateFood(snake: Coordinate[]): Coordinate {
    let newFood: Coordinate;
    do {
      newFood = [
        Math.floor(Math.random() * BOARD_SIZE),
        Math.floor(Math.random() * BOARD_SIZE),
      ];
    } while (snake.some(([x, y]) => x === newFood[0] && y === newFood[1]));
    return newFood;
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent): void => {
      switch (e.key) {
        case 'ArrowUp':
          setDirection([-1, 0]);
          break;
        case 'ArrowDown':
          setDirection([1, 0]);
          break;
        case 'ArrowLeft':
          setDirection([0, -1]);
          break;
        case 'ArrowRight':
          setDirection([0, 1]);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (gameOver) return;

    intervalRef.current = setInterval(() => {
      setSnake(prev => {
        const newHead: Coordinate = [
          prev[0][0] + direction[0],
          prev[0][1] + direction[1],
        ];

        const hitWall =
          newHead[0] < 0 ||
          newHead[1] < 0 ||
          newHead[0] >= BOARD_SIZE ||
          newHead[1] >= BOARD_SIZE;

        const hitSelf = prev.some(([x, y]) => x === newHead[0] && y === newHead[1]);

        if (hitWall || hitSelf) {
          setGameOver(true);
          if (intervalRef.current) clearInterval(intervalRef.current);
          return prev;
        }

        const newSnake = [newHead, ...prev];

        if (newHead[0] === food[0] && newHead[1] === food[1]) {
          setFood(generateFood(newSnake));
        } else {
          newSnake.pop();
        }

        return newSnake;
      });
    }, 200);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [direction, food, gameOver]);

  return (
    <div style={{ textAlign: 'center', marginTop: '20px' }}>
      <h1>React Snake Game</h1>
      {gameOver && <h2 style={{ color: 'red' }}>Game Over</h2>}
      <div
        style={{
          display: 'grid',
          gridTemplateRows: `repeat(${BOARD_SIZE}, 20px)`,
          gridTemplateColumns: `repeat(${BOARD_SIZE}, 20px)`,
          margin: 'auto',
          width: 'fit-content',
          border: '2px solid black',
        }}
      >
        {Array.from({ length: BOARD_SIZE * BOARD_SIZE }, (_, i) => {
          const row = Math.floor(i / BOARD_SIZE);
          const col = i % BOARD_SIZE;
          const isSnake = snake.some(([x, y]) => x === row && y === col);
          const isFood = food[0] === row && food[1] === col;

          return (
            <div
              key={i}
              style={{
                width: "20px",
                height: "20px",
                backgroundColor: isSnake ? 'green' : isFood ? 'red' : 'white',
                border: '1px solid #ccc',
              }}
            />
          );
        })}
      </div>
    </div>
  );
}

export default App;
