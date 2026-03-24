import Phaser from "phaser";
import { Flower } from "./Flower";
import { getRandomType } from "./functions/boardHelpers";

interface BoardItem {
  object: Flower;
}

export class BoardScene extends Phaser.Scene {
  board: (BoardItem | null)[][] = [];
  width = 7;
  height = 5;
  frameWidth = 32;
  frameHeight = 32;

  colOffset = 6;
  cellW = this.frameWidth + this.colOffset;
  cellH = this.frameHeight + this.colOffset;
  startX = 0;
  startY = 20;

  get flowers(): Flower[] {
    return this.board
      .flat()
      .map((item) => item?.object)
      .filter((obj): obj is Flower => obj !== null);
  }

  constructor() {
    super({ key: "BoardScene" });
  }

  preload() {
    this.load.spritesheet("mushroom", "assets/mushroom.png", {
      frameWidth: this.frameWidth,
      frameHeight: this.frameHeight,
    });
  }

  create() {
    this.board = this.createBoard(this.width, this.height);

    this.flowers.forEach((obj: Flower) => {
      obj.setInteractive();
      this.onFlowerClick(obj);
    });

    this.createGrid();
  }

  update() {}

  createBoard(width: number, height: number): BoardItem[][] {
    const board = Array.from({ length: height }, () =>
      Array.from({ length: width }, () => {
        return { object: new Flower(this, 0, 0, getRandomType()) };
      }),
    );

    return board;
  }

  onFlowerClick(obj: Flower) {
    obj.on("pointerdown", () => {
      obj.setSelected(!obj.selected);
      this.selectAdjacent(obj);
    });
  }

  selectAdjacent(obj: Flower) {
    const isSelected = obj.selected;
    const visited = new Set<string>();
    const queue: string[] = [];
    let rowIndex = -1;
    let colIndex = -1;

    rowIndex = this.board.findIndex((row) => {
      colIndex = row.findIndex((item) => item?.object === obj);
      return colIndex >= 0;
    });

    queue.push(`${rowIndex},${colIndex}`);

    if (!isSelected) {
      obj.destroy();
      this.board[rowIndex].splice(colIndex, 1, null);
    }

    while (queue.length > 0) {
      const current = queue.shift()!;
      visited.add(current);

      const [row, col] = current.split(",").map(Number);

      if (row > 0) {
        const up = this.board[row - 1][col];
        const key = `${row - 1},${col}`;
        if (!visited.has(key)) {
          visited.add(key);
          if (up?.object?.flowerType === obj.flowerType) {
            if (isSelected) {
              up.object.setSelected(isSelected);
            } else {
              up.object.destroy();
              this.board[row - 1].splice(col, 1, null);
            }
            queue.push(key);
          }
        }
      }
      if (row < this.board.length - 1) {
        const down = this.board[row + 1][col];
        const key = `${row + 1},${col}`;
        if (!visited.has(key)) {
          visited.add(key);
          if (down?.object?.flowerType === obj.flowerType) {
            if (isSelected) {
              down.object.setSelected(isSelected);
            } else {
              down.object.destroy();
              this.board[row + 1].splice(col, 1, null);
            }
            queue.push(key);
          }
        }
      }
      if (col > 0) {
        const left = this.board[row][col - 1];
        const key = `${row},${col - 1}`;
        if (!visited.has(key)) {
          visited.add(key);
          if (left?.object?.flowerType === obj.flowerType) {
            if (isSelected) {
              left.object.setSelected(isSelected);
            } else {
              left.object.destroy();
              this.board[row].splice(col - 1, 1, null);
            }
            queue.push(key);
          }
        }
      }
      if (col < this.board[row].length - 1) {
        const right = this.board[row][col + 1];
        const key = `${row},${col + 1}`;
        if (!visited.has(key)) {
          visited.add(key);
          if (right?.object?.flowerType === obj.flowerType) {
            if (isSelected) {
              right.object.setSelected(isSelected);
            } else {
              right.object.destroy();
              this.board[row].splice(col + 1, 1, null);
            }
            queue.push(key);
          }
        }
      }
    }

    console.log(this.board);
  }

  createGrid() {
    const gridCenterX = this.startX + (this.width * this.cellW) / 2;
    const gridCenterY = this.startY + (this.height * this.cellH) / 2;

    this.add.grid(
      gridCenterX + this.cellW / 2 - this.colOffset / 2,
      gridCenterY + this.cellH / 2 - this.colOffset / 2,
      this.width * this.cellW,
      this.height * this.cellH,
      this.cellW,
      this.cellH,
      0x000000,
      0,
      0x888888,
      1,
    );

    Phaser.Actions.GridAlign(this.flowers, {
      width: this.width,
      height: this.height,
      cellWidth: this.cellW,
      cellHeight: this.cellH,
      x: this.startX + this.cellW / 2,
      y: this.startY + this.cellH / 2,
    });
  }
}
