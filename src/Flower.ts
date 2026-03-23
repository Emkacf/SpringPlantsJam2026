import Phaser from "phaser";

export type FlowerType = 0 | 1 | 2;

export class Flower extends Phaser.GameObjects.Sprite {
  selected: boolean;
  flowerType: FlowerType;

  constructor(scene: Phaser.Scene, x: number, y: number, type: FlowerType) {
    super(scene, x, y, "mushroom", type);
    this.selected = false;
    this.scene = scene;
    this.flowerType = type;
    scene.add.existing(this);
  }

  setSelected(selected: boolean) {
    this.selected = selected;
    if (this.selected) {
      this.setTint(0x00ff00);
    } else {
      this.clearTint();
    }
  }

  update() {}
}
