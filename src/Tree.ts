import Phaser from "phaser";

export type Phase = 0 | 1 | 2;

const phaseConfig = {
  0: {
    waterNeeded: 100,
    fertilizerNeeded: 10,
    lightNeeded: 100,
  },
  1: {
    waterNeeded: 150,
    fertilizerNeeded: 30,
    lightNeeded: 200,
  },
  2: {
    waterNeeded: 150,
    fertilizerNeeded: 100,
    lightNeeded: 300,
  },
};

export class Tree extends Phaser.GameObjects.Sprite {
  waterNeeded: number;
  fertilizerNeeded: number;
  lightNeeded: number;
  phase: Phase;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, "mushroom", 0);
    this.scene = scene;
    this.phase = 0;
    this.waterNeeded = 100;
    this.lightNeeded = 100;
    this.fertilizerNeeded = 10;
    scene.add.existing(this);
  }

  grow() {
    let { waterNeeded, fertilizerNeeded, lightNeeded } =
      phaseConfig[this.phase];
    this.waterNeeded = waterNeeded;
    this.fertilizerNeeded = fertilizerNeeded;
    this.lightNeeded = lightNeeded;
    this.phase++;
  }

  update() {}
}
