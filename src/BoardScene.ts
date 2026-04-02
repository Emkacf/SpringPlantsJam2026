import Phaser from "phaser";
import { Flower } from "./Flower";
import { getRandomType } from "./functions/boardHelpers";
import { BOARD_SIZE } from "./main";
import { Tree } from "./Tree";

interface BoardItem {
  object: Flower;
}

export class BoardScene extends Phaser.Scene {
  water: number = 0;
  light: number = 0;
  fertilizer: number = 0;

  waterText!: Phaser.GameObjects.Text;
  lightText!: Phaser.GameObjects.Text;
  fertilizerText!: Phaser.GameObjects.Text;

  tree!: Tree;

  deletedCount: number = 0;

  private treeDying = false;
  private musicLayers: Phaser.Sound.WebAudioSound[] = [];

  board: (BoardItem | null)[][] = [];
  width = 7;
  height = 5;
  frameWidth = 64;
  frameHeight = 64;

  colOffset = 6;
  cellW = this.frameWidth + this.colOffset;
  cellH = this.frameHeight + this.colOffset;
  startX = BOARD_SIZE.width * 0.4;
  startY = BOARD_SIZE.height * 0.22;

  waterBg!: Phaser.GameObjects.Rectangle;
  lightBg!: Phaser.GameObjects.Rectangle;
  fertilizerBg!: Phaser.GameObjects.Rectangle;

  get flowers(): Flower[] {
    return this.board
      .flat()
      .map((item) => item?.object)
      .filter((obj): obj is Flower => obj != null);
  }

  constructor() {
    super({ key: "BoardScene" });
  }

  preload() {
    this.load.spritesheet("icons", "assets/icons.png", {
      frameWidth: this.frameWidth,
      frameHeight: this.frameHeight,
    });

    this.load.audio(
      "fertilizer_click_01",
      "assets/sounds/fertilizer_click_01.wav",
    );
    this.load.audio(
      "fertilizer_click_02",
      "assets/sounds/fertilizer_click_02.wav",
    );
    this.load.audio(
      "fertilizer_click_03",
      "assets/sounds/fertilizer_click_03.wav",
    );

    this.load.audio("light_click_01", "assets/sounds/light_click_01.wav");
    this.load.audio("light_click_02", "assets/sounds/light_click_02.wav");
    this.load.audio("light_click_03", "assets/sounds/light_click_03.wav");

    this.load.audio("water_click_01", "assets/sounds/water_click_01.wav");
    this.load.audio("water_click_02", "assets/sounds/water_click_02.wav");
    this.load.audio("water_click_03", "assets/sounds/water_click_03.wav");

    this.load.audio(
      "fertilizer_success_01",
      "assets/sounds/fertilizer_success_01.wav",
    );
    this.load.audio(
      "fertilizer_success_02",
      "assets/sounds/fertilizer_success_02.wav",
    );
    this.load.audio(
      "fertilizer_success_03",
      "assets/sounds/fertilizer_success_03.wav",
    );

    this.load.audio("light_success_01", "assets/sounds/light_success_01.wav");
    this.load.audio("light_success_02", "assets/sounds/light_success_02.wav");
    this.load.audio("light_success_03", "assets/sounds/light_success_03.wav");

    this.load.audio("water_success_01", "assets/sounds/water_success_01.wav");
    this.load.audio("water_success_02", "assets/sounds/water_success_02.wav");
    this.load.audio("water_success_03", "assets/sounds/water_success_03.wav");

    this.load.audio(
      "springplants_music_layer_01",
      "assets/sounds/springplants_music_layer_01.wav",
    );
    this.load.audio(
      "springplants_music_layer_02",
      "assets/sounds/springplants_music_layer_02.wav",
    );
    this.load.audio(
      "springplants_music_layer_03",
      "assets/sounds/springplants_music_layer_03.wav",
    );
  }

  create() {
    for (let i = 1; i <= 3; i++) {
      const layer = this.sound.add(`springplants_music_layer_0${i}`, {
        loop: true,
        volume: i === 1 ? 1 : 0,
      }) as Phaser.Sound.WebAudioSound;
      layer.play();
      this.musicLayers.push(layer);
    }

    this.tree = new Tree(this, 180, 320);
    this.tree.setDisplaySize(200, 350);
    const cardWidth = 200;
    const cardGap = 40;
    const topY = 16;
    const textOffsetX = 10;
    const textY = 18;

    const totalHudWidth = cardWidth * 3 + cardGap * 2;
    const hudStartX = (BOARD_SIZE.width - totalHudWidth) / 2;

    const waterX = hudStartX;
    const lightX = waterX + cardWidth + cardGap;
    const fertilizerX = lightX + cardWidth + cardGap;

    this.waterBg = this.makeStatCard(waterX, topY, 0x38bdf8);
    this.lightBg = this.makeStatCard(lightX, topY, 0xfacc15);
    this.fertilizerBg = this.makeStatCard(fertilizerX, topY, 0x86efac);

    this.waterText = this.makeStatText(waterX + textOffsetX, textY, "#7dd3fc");
    this.lightText = this.makeStatText(lightX + textOffsetX, textY, "#fde047");
    this.fertilizerText = this.makeStatText(
      fertilizerX + textOffsetX,
      textY,
      "#bbf7d0",
    );

    this.refreshStats();
    this.createLevel();

    this.add
      .text(
        685,
        90,
        "Match icons to harvest light, water & fertilizer. Watch your tree grow!",
        {
          fontFamily: "Trebuchet MS, Verdana, sans-serif",
          fontSize: "14px",
          color: "#e5e7eb",
          align: "center",
          stroke: "#0b1220",
          strokeThickness: 2,
        },
      )
      .setOrigin(0.5, 0)
      .setScrollFactor(0);

    this.add
      .text(
        685,
        110,
        "The more you match, the more you harvest! Try to get big combos for extra points!",
        {
          fontFamily: "Trebuchet MS, Verdana, sans-serif",
          fontSize: "14px",
          color: "#e5e7eb",
          align: "center",
          stroke: "#0b1220",
          strokeThickness: 2,
        },
      )
      .setOrigin(0.5, 0)
      .setScrollFactor(0);

    this.add
      .text(
        685,
        130,
        "⚠ Be careful! Too much of any resource will overwhelm the tree and it will die!",
        {
          fontFamily: "Trebuchet MS, Verdana, sans-serif",
          fontSize: "14px",
          color: "#ffffff",
          align: "center",
          stroke: "#bb0606",
          strokeThickness: 2,
        },
      )
      .setOrigin(0.5, 0)
      .setScrollFactor(0);
  }

  private makeStatCard(x: number, y: number, tint: number) {
    return this.add
      .rectangle(x, y, 230, 44, 0x1f2937, 0.92)
      .setStrokeStyle(2, tint, 0.95)
      .setOrigin(0, 0)
      .setScrollFactor(0);
  }

  private makeStatText(x: number, y: number, color: string) {
    return this.add
      .text(x, y, "", {
        fontFamily: "Trebuchet MS, Verdana, sans-serif",
        fontSize: "20px",
        fontStyle: "bold",
        color,
        align: "left",
        stroke: "#0b1220",
        strokeThickness: 3,
      })
      .setShadow(0, 2, "#000000", 3, true, true)
      .setPadding(10, 8, 10, 8)
      .setScrollFactor(0);
  }

  private refreshStats() {
    this.waterText.setText(
      "WATER  " + this.water + "/" + this.tree.waterNeeded,
    );
    this.lightText.setText(
      "LIGHT  " + this.light + "/" + this.tree.lightNeeded,
    );
    this.fertilizerText.setText(
      "FERTILIZER  " + this.fertilizer + "/" + this.tree.fertilizerNeeded,
    );

    const danger = 0xff4444;
    this.waterBg.setStrokeStyle(
      2,
      this.water > this.tree.waterNeeded * 1.5 ? danger : 0x38bdf8,
      0.95,
    );
    this.lightBg.setStrokeStyle(
      2,
      this.light > this.tree.lightNeeded * 1.5 ? danger : 0xfacc15,
      0.95,
    );
    this.fertilizerBg.setStrokeStyle(
      2,
      this.fertilizer > this.tree.fertilizerNeeded * 1.5 ? danger : 0x86efac,
      0.95,
    );
  }

  playClickSound(type: number) {
    const clickSounds = [
      `light_click_0${getRandomType() + 1}`,
      `water_click_0${getRandomType() + 1}`,
      `fertilizer_click_0${getRandomType() + 1}`,
    ];
    this.sound.play(clickSounds[type], { volume: 0.4 });
  }

  playSuccessSound(type: number) {
    const successSounds = [
      `light_success_0${getRandomType() + 1}`,
      `water_success_0${getRandomType() + 1}`,
      `fertilizer_success_0${getRandomType() + 1}`,
    ];
    this.sound.play(successSounds[type], { volume: 0.4 });
  }

  update() {
    this.refreshStats();
    if (
      this.water >= this.tree.waterNeeded &&
      this.light >= this.tree.lightNeeded &&
      this.fertilizer >= this.tree.fertilizerNeeded
    ) {
      if (this.tree.phase === 2) {
        this.wonGame();
        return;
      }
      this.tree.grow();
      this.tweens.add({
        targets: this.musicLayers[this.tree.phase],
        volume: 1,
        duration: 1000,
        ease: "Linear",
      });

      this.clearLevel();
      this.createLevel();
      this.water = 0;
      this.light = 0;
      this.fertilizer = 0;

      const growMsg = this.add
        .text(BOARD_SIZE.width / 2, BOARD_SIZE.height / 2, "The tree grew!", {
          fontFamily: "Trebuchet MS, Verdana, sans-serif",
          fontSize: "26px",
          fontStyle: "bold",
          color: "#86efac",
          align: "center",
          stroke: "#0b1220",
          strokeThickness: 4,
        })
        .setOrigin(0.5)
        .setScrollFactor(0)
        .setDepth(100);
      this.time.delayedCall(1500, () => growMsg.destroy());
    }

    if (!this.treeDying) {
      const overWater = this.water > this.tree.waterNeeded * 2;
      const overLight = this.light > this.tree.lightNeeded * 2;
      const overFertilizer = this.fertilizer > this.tree.fertilizerNeeded * 2;
      if (overWater || overLight || overFertilizer) {
        const resource = overWater
          ? "water"
          : overLight
            ? "light"
            : "fertilizer";
        this.treeDying = true;
        this.handleTreeDeath(resource);
      }
    }
  }

  wonGame() {
    this.add
      .text(
        BOARD_SIZE.width / 2,
        BOARD_SIZE.height / 2,
        `Congratulations! Your tree is fully grown!`,
        {
          fontFamily: "Trebuchet MS, Verdana, sans-serif",
          fontSize: "26px",
          fontStyle: "bold",
          color: "#86efac",
          align: "center",
          stroke: "#0b1220",
          strokeThickness: 4,
        },
      )
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(100);
  }

  handleTreeDeath(resource: string) {
    this.water = 0;
    this.light = 0;
    this.fertilizer = 0;

    const msg = this.add
      .text(
        BOARD_SIZE.width / 2,
        BOARD_SIZE.height / 2,
        `Too much ${resource}!\nThe tree is overwhelmed and wilts back.`,
        {
          fontFamily: "Trebuchet MS, Verdana, sans-serif",
          fontSize: "22px",
          fontStyle: "bold",
          color: "#ff4444",
          align: "center",
          stroke: "#0b1220",
          strokeThickness: 4,
        },
      )
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(100);

    this.tree.die(() => {
      this.treeDying = false;
      this.musicLayers.slice(1).forEach((layer) => {
        this.tweens.add({
          targets: layer,
          volume: 0,
          duration: 500,
          ease: "Linear",
        });
      });
      this.time.delayedCall(800, () => msg.destroy());
      this.clearLevel();
      this.createLevel();
    });
  }

  clearLevel() {
    this.flowers.forEach((flower) => flower.destroy());
    this.board = [];
  }

  createLevel() {
    this.board = this.createBoard(this.width, this.height);

    this.flowers.forEach((obj: Flower) => {
      obj.setInteractive();
      this.onFlowerClick(obj);
    });

    this.createGrid();
  }

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
      if (!obj.selected) {
        this.unselectAll();
      }
      obj.setSelected(!obj.selected);

      if (obj.selected) {
        this.playClickSound(obj.flowerType);
      } else {
        this.playSuccessSound(obj.flowerType);
      }

      this.selectAdjacent(obj);
      this.collapseColumns();
      this.isFinished();
    });
  }

  isFinished() {
    const nonNull = this.flowers.filter((item) => item != null);
    if (nonNull.length === 0) {
      this.createLevel();
    }
  }

  unselectAll() {
    this.flowers.forEach((flower) => flower && flower.setSelected(false));
  }

  collapseColumns() {
    const moves: Array<{ flower: Flower; row: number; col: number }> = [];

    for (let col = 0; col < this.width; col++) {
      let writeRow = this.height - 1;

      for (let row = this.height - 1; row >= 0; row--) {
        const item = this.board[row][col];
        if (!item) continue;

        if (writeRow !== row) {
          this.board[writeRow][col] = item;
          this.board[row][col] = null;
          moves.push({ flower: item.object, row: writeRow, col });
        }
        writeRow--;
      }

      for (let row = writeRow; row >= 0; row--) {
        this.board[row][col] = null;
      }
    }

    this.animateMoves(moves);
  }

  animateMoves(moves: Array<{ flower: Flower; row: number; col: number }>) {
    moves.forEach(({ flower, row, col }) => {
      this.tweens.add({
        targets: flower,
        x: this.startX + this.cellW / 2 + col * this.cellW + 32,
        y: this.startY + this.cellH / 2 + row * this.cellH + 30,
        duration: 180,
        ease: "Quad.easeIn",
      });
    });
  }

  selectAdjacent(obj: Flower) {
    const isSelected = obj.selected;
    const visited = new Set<string>();
    const queue: string[] = [];
    let rowIndex = -1;
    let colIndex = -1;
    this.deletedCount = 0;

    rowIndex = this.board.findIndex((row) => {
      colIndex = row.findIndex((item) => item?.object === obj);
      return colIndex >= 0;
    });

    queue.push(`${rowIndex},${colIndex}`);

    if (!isSelected) {
      obj.destroy();
      this.deletedCount++;
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
              this.deletedCount++;

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
              this.deletedCount++;
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
              this.deletedCount++;
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
              this.deletedCount++;
              this.board[row].splice(col + 1, 1, null);
            }
            queue.push(key);
          }
        }
      }
    }

    if (!obj.selected) {
      let bonus: number;
      if (this.deletedCount >= 10) {
        bonus = 3;
      } else if (this.deletedCount >= 6) {
        bonus = 2;
      } else if (this.deletedCount >= 3) {
        bonus = 1.5;
      } else {
        bonus = 1;
      }

      if (obj.flowerType === 1) {
        this.water += Math.ceil(this.deletedCount * bonus);
      }
      if (obj.flowerType === 0) {
        this.light += Math.ceil(this.deletedCount * bonus);
      }
      if (obj.flowerType === 2) {
        this.fertilizer += Math.ceil(this.deletedCount * bonus);
      }
    }
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
