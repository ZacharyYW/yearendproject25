import { generateRoom } from './RoomGenerator';
import { RoomNode, Direction } from './Types';

let nextRoomId = 1;

export function createRoomNode(difficulty = 1): RoomNode {
  return {
    id: nextRoomId++,
    room: generateRoom(nextRoomId, 15, 15, difficulty),
    neighbors: {},
    difficulty,
  };
}

export function linkRooms(a: RoomNode, b: RoomNode, dir: Direction) {
  const opposites: Record<Direction, Direction> = {
    up: 'down',
    down: 'up',
    left: 'right',
    right: 'left',
  };
  a.neighbors[dir] = b;
  b.neighbors[opposites[dir]] = a;
}
