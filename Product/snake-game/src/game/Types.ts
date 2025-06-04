export type Coordinate = [number, number];

// Directions as strings
export type Direction = 'up' | 'down' | 'left' | 'right';

// Direction vectors mapping
export const directionVectors: Record<Direction, Coordinate> = {
  up: [0, -1],
  down: [0, 1],
  left: [-1, 0],
  right: [1, 0],
};

export interface Room {
  width: number;
  height: number;
  walls: Coordinate[];
  apples: Coordinate[];
  spawnPoint: Coordinate;
}

export interface RoomNode {
  id: number;
  room: Room;
  neighbors: Partial<Record<Direction, RoomNode>>;
  difficulty: number;
}
