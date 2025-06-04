import { Coordinate } from './Types';

export class Snake {
  body: Coordinate[];
  direction: Coordinate;  // [dx, dy]
  growing: number;

  constructor(spawnPoint: Coordinate) {
    this.body = [spawnPoint];
    this.direction = [1, 0]; // default moving right
    this.growing = 0;
  }

  setDirection([dx, dy]: Coordinate) {
    const [currDx, currDy] = this.direction;
    if (dx === -currDx && dy === -currDy) return; // prevent reversing
    this.direction = [dx, dy];
  }

  getHead(): Coordinate {
    return this.body[0];
  }

  move() {
    const [dx, dy] = this.direction;
    const [headX, headY] = this.getHead();
    const newHead: Coordinate = [headX + dx, headY + dy];

    this.body.unshift(newHead);

    if (this.growing > 0) {
      this.growing--;
    } else {
      this.body.pop();
    }
  }

  eatApple() {
    this.growing++;
  }

  reset(spawnPoint: Coordinate, direction: Coordinate) {
    this.body = [spawnPoint];
    this.direction = direction;
    this.growing = 0;
  }
}
