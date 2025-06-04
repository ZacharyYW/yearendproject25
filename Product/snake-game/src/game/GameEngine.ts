import { Snake } from './Snake';
import { Coordinate, Direction, RoomNode } from './Types';
import { createRoomNode, linkRooms } from './RoomGraph';

export class GameEngine {
  snake: Snake;
  currentRoom: RoomNode;
  gameOver: boolean;
  visitedRoomCount: number;
  started: boolean;

  constructor(initialRoom: RoomNode) {
    this.currentRoom = initialRoom;
    this.snake = new Snake(initialRoom.room.spawnPoint);
    this.gameOver = false;
    this.visitedRoomCount = 1;
    this.started = false;
  }

  update() {
    if (this.gameOver) return;
    if (!this.started) return;

    this.snake.move();
    const head = this.snake.getHead();
    const { room } = this.currentRoom;

    // Check collisions with walls
    const hitWall = room.walls.some(([x, y]) => x === head[0] && y === head[1]);
    // Check collisions with snake body (skip head)
    const hitSelf = this.snake.body.slice(1).some(([x, y]) => x === head[0] && y === head[1]);

    if (hitWall || hitSelf || !this.inBounds(head)) {
      this.gameOver = true;
      return;
    }

    // Check apple collision
    const appleIndex = room.apples.findIndex(([x, y]) => x === head[0] && y === head[1]);
    if (appleIndex !== -1) {
      this.snake.eatApple();
      room.apples.splice(appleIndex, 1);
      if (room.apples.length === 0) {
        this.unlockPassages();
      }
    }

    // Check if snake is at a passage leading to next room
    const transitionDir = this.getPassageDirection(head);
    if (transitionDir) {
      this.transitionRoom(transitionDir);
    }
  }

  unlockPassages() {
    const { width, height, walls } = this.currentRoom.room;

    // Coordinates for doors on edges
    const exits: Record<Direction, Coordinate> = {
      up: [Math.floor(width / 2), 0],
      down: [Math.floor(width / 2), height - 1],
      left: [0, Math.floor(height / 2)],
      right: [width - 1, Math.floor(height / 2)],
    };

    // Remove walls for doors
    Object.entries(exits).forEach(([dir, coord]) => {
      const dirKey = dir as Direction;
      const index = walls.findIndex(([x, y]) => x === coord[0] && y === coord[1]);
      if (index !== -1) {
        walls.splice(index, 1);
      }

      // Create new connected room if not exist
      if (!this.currentRoom.neighbors[dirKey]) {
        const newRoom = createRoomNode(this.visitedRoomCount + 1);
        linkRooms(this.currentRoom, newRoom, dirKey);
      }
    });
  }

  // Opposite side mapping for entrance when exiting a room
  private oppositeDirections: Record<Direction, Direction> = {
    up: 'down',
    down: 'up',
    left: 'right',
    right: 'left',
  };

  // Direction vectors for movement inside the new room (inward)
  private directionVectors: Record<Direction, Coordinate> = {
    up: [0, 1],
    down: [0, -1],
    left: [1, 0],
    right: [-1, 0],
  };

  transitionRoom(exitDirection: Direction) {
    const next = this.currentRoom.neighbors[exitDirection];
    if (!next) return;

    this.visitedRoomCount++;
    this.currentRoom = next;

    // Determine entrance side opposite of exit
    const entranceDirection = this.oppositeDirections[exitDirection];
    const { width, height } = next.room;

    let spawnPoint: Coordinate;
    switch (entranceDirection) {
      case 'up':
        spawnPoint = [Math.floor(width / 2), 0];
        break;
      case 'down':
        spawnPoint = [Math.floor(width / 2), height - 1];
        break;
      case 'left':
        spawnPoint = [0, Math.floor(height / 2)];
        break;
      case 'right':
        spawnPoint = [width - 1, Math.floor(height / 2)];
        break;
      default:
        spawnPoint = next.room.spawnPoint;
    }

    // Snake faces inward into the room
    const moveDirection = this.directionVectors[entranceDirection];

    // Shift snake body so head is at spawnPoint and body preserves shape
    const oldHead = this.snake.getHead();
    const offsetX = spawnPoint[0] - oldHead[0];
    const offsetY = spawnPoint[1] - oldHead[1];

    this.snake.body = this.snake.body.map(([x, y]) => [x + offsetX, y + offsetY]);
    this.snake.direction = moveDirection;
  }

  changeDirection(dir: Coordinate) {
    if (!this.gameOver) this.started = true;
    this.snake.setDirection(dir);
  }

  inBounds([x, y]: Coordinate): boolean {
    const { width, height } = this.currentRoom.room;
    return x >= 0 && y >= 0 && x < width && y < height;
  }

  getPassageDirection([x, y]: Coordinate): Direction | null {
    const { width, height } = this.currentRoom.room;
    if (y === 0 && this.currentRoom.neighbors.up) return 'up';
    if (y === height - 1 && this.currentRoom.neighbors.down) return 'down';
    if (x === 0 && this.currentRoom.neighbors.left) return 'left';
    if (x === width - 1 && this.currentRoom.neighbors.right) return 'right';
    return null;
  }
}
