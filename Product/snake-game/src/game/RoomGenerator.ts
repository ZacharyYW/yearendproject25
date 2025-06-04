import { Coordinate, Room } from './Types';

function getRandomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function coordinateToString([x, y]: Coordinate) {
  return `${x},${y}`;
}

export function generateRoom(
  id = 0,
  width = 15,
  height = 15,
  difficulty = 1
): Room {
  const walls: Set<string> = new Set();

  // Outer walls
  for (let x = 0; x < width; x++) {
    walls.add(coordinateToString([x, 0]));
    walls.add(coordinateToString([x, height - 1]));
  }
  for (let y = 0; y < height; y++) {
    walls.add(coordinateToString([0, y]));
    walls.add(coordinateToString([width - 1, y]));
  }

  // Internal walls (scale with difficulty)
  const internalWallCount = getRandomInt(5 + difficulty * 2, 10 + difficulty * 3);
  for (let i = 0; i < internalWallCount; i++) {
    const x = getRandomInt(1, width - 2);
    const y = getRandomInt(1, height - 2);
    walls.add(coordinateToString([x, y]));
  }

  // Spawn point not in walls
  let spawnPoint: Coordinate;
  while (true) {
    const x = getRandomInt(1, width - 2);
    const y = getRandomInt(1, height - 2);
    if (!walls.has(coordinateToString([x, y]))) {
      spawnPoint = [x, y];
      break;
    }
  }

  // Apples scale with difficulty, max 5 apples
  const appleCount = Math.min(5, 1 + Math.floor(difficulty / 2));
  const apples: Coordinate[] = [];
  const forbidden = new Set([...walls, coordinateToString(spawnPoint)]);
  while (apples.length < appleCount) {
    const x = getRandomInt(1, width - 2);
    const y = getRandomInt(1, height - 2);
    const key = coordinateToString([x, y]);
    if (!forbidden.has(key)) {
      apples.push([x, y]);
      forbidden.add(key);
    }
  }

  return {
    width,
    height,
    spawnPoint,
    walls: Array.from(walls).map(s => s.split(',').map(Number) as Coordinate),
    apples,
  };
}
