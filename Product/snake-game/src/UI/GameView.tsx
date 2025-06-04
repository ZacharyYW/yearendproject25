"use client";

import React, { useEffect, useState } from "react";
import { GameEngine } from "../game/GameEngine";
import { createRoomNode } from "../game/RoomGraph";
import { Coordinate, Direction } from "../game/Types";

export function GameView() {
  const [gameEngine] = useState(() => new GameEngine(createRoomNode(1)));
  const [, setTick] = useState(0); // dummy state to force render
  const [cellSize, setCellSize] = useState(24);

  // Dynamically calculate cell size based on screen size
  useEffect(() => {
    function updateSize() {
      const { innerWidth, innerHeight } = window;
      const maxWidth = innerWidth * 0.9;
      const maxHeight = innerHeight * 0.75;

      const room = gameEngine.currentRoom.room;
      const sizeW = Math.floor(maxWidth / room.width);
      const sizeH = Math.floor(maxHeight / room.height);

      setCellSize(Math.max(12, Math.min(sizeW, sizeH)));
    }

    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, [gameEngine]);

  // Run game loop
  useEffect(() => {
    let animationFrameId: number;
    let lastTime = performance.now();
    const speed = 120; // in ms per tick

    function loop(time: number) {
      if (time - lastTime > speed) {
        gameEngine.update();
        setTick((tick) => tick + 1); // force rerender
        lastTime = time;
      }
      if (!gameEngine.gameOver) {
        animationFrameId = requestAnimationFrame(loop);
      }
    }

    animationFrameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationFrameId);
  }, [gameEngine]);

  // Keyboard controls
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      switch (e.key) {
        case "ArrowUp":
          gameEngine.changeDirection([0, -1]);
          break;
        case "ArrowDown":
          gameEngine.changeDirection([0, 1]);
          break;
        case "ArrowLeft":
          gameEngine.changeDirection([-1, 0]);
          break;
        case "ArrowRight":
          gameEngine.changeDirection([1, 0]);
          break;
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [gameEngine]);

  const { room } = gameEngine.currentRoom;
  const widthPx = room.width * cellSize;
  const heightPx = room.height * cellSize;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-4">
      <h1 className="text-2xl font-bold mb-2">Snake Roguelike</h1>
      <p>
        Room ID: {gameEngine.currentRoom.id} | Difficulty:{" "}
        {gameEngine.currentRoom.difficulty}
      </p>
      <p className="mb-4">
        {gameEngine.gameOver
          ? "Game Over!"
          : "Collect all apples and proceed through the doors!"}
      </p>
      <div
        className="relative bg-gray-900 border-4 border-gray-700"
        style={{ width: widthPx, height: heightPx }}
      >
        {/* Walls */}
        {room.walls.map(([x, y]) => (
          <div
            key={`wall-${x}-${y}`}
            className="absolute bg-gray-600"
            style={{
              width: cellSize,
              height: cellSize,
              left: x * cellSize,
              top: y * cellSize,
            }}
          />
        ))}

        {/* Apples */}
        {room.apples.map(([x, y]) => (
          <div
            key={`apple-${x}-${y}`}
            className="absolute bg-red-500 rounded-full"
            style={{
              width: cellSize * 0.8,
              height: cellSize * 0.8,
              left: x * cellSize + cellSize * 0.1,
              top: y * cellSize + cellSize * 0.1,
            }}
          />
        ))}

        {/* Snake */}
        {gameEngine.snake.body.map(([x, y], i) => (
          <div
            key={`snake-${i}`}
            className={`absolute rounded ${
              i === 0 ? "bg-green-400" : "bg-green-700"
            }`}
            style={{
              width: cellSize,
              height: cellSize,
              left: x * cellSize,
              top: y * cellSize,
              transition: "left 0.1s linear, top 0.1s linear",
            }}
          />
        ))}
      </div>
    </div>
  );
}
