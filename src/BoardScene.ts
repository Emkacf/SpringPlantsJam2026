import Phaser from "phaser";
import { Flower, FlowerType } from "./Flower";

export class BoardScene extends Phaser.Scene {
  flowers: Flower[] = [];
  constructor() {
    super({ key: "BoardScene" });
  }

  preload() {
    this.load.spritesheet("mushroom", "assets/mushroom.png", {
      frameWidth: 32,
      frameHeight: 32,
    });
  }

  objects: Flower[] = [];

  create() {
    this.createGrid();

    for (let i = 0; i < 20; i++) {
      const random = Math.floor(Math.random() * 3) as FlowerType;
      this.objects.push(new Flower(this, 0, 0, random));
    }

    Phaser.Actions.GridAlign(this.objects, {
      width: 5,
      height: 4,
      cellWidth: 38,
      cellHeight: 38,
      x: 100,
      y: 20,
    });

    this.objects.forEach((obj: Flower) => {
      obj.setInteractive();
      this.onFlowerClick(obj);
    });
  }

  update() {}

  onFlowerClick(obj: Flower) {
    obj.on("pointerdown", () => {
      obj.setSelected(true);
      const selected = this.objects.filter((obj) => obj.selected);
      if (selected.length === 2) {
        const i1 = this.objects.indexOf(selected[0]);
        const i2 = this.objects.indexOf(selected[1]);
        const tempObj = { ...this.objects[i1] };

        this.tweens.add({
          targets: this.objects[i1],
          x: this.objects[i2].x,
          y: this.objects[i2].y,
          duration: 300,
          ease: "Power1",
          yoyo: false,
          repeat: 0,
        });

        this.tweens.add({
          targets: this.objects[i2],
          x: tempObj.x,
          y: tempObj.y,
          duration: 300,
          ease: "Power1",
          yoyo: false,
          repeat: 0,
        });

        setTimeout(() => {
          this.objects.forEach((obj) => obj.setSelected(false));
        }, 300);
      }
    });
  }

  createGrid() {
    this.add.grid(192, 95, 190, 152, 38, 38, 0x000000, 0, 0x888888, 1);
  }
}
