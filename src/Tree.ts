import Phaser from "phaser";

export type Phase = 0 | 1 | 2;

const phaseConfig = {
  0: {
    waterNeeded: 50,
    fertilizerNeeded: 30,
    lightNeeded: 40,
  },
  1: {
    waterNeeded: 70,
    fertilizerNeeded: 40,
    lightNeeded: 50,
  },
  2: {
    waterNeeded: 140,
    fertilizerNeeded: 80,
    lightNeeded: 120,
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
    this.waterNeeded = phaseConfig[this.phase].waterNeeded;
    this.fertilizerNeeded = phaseConfig[this.phase].fertilizerNeeded;
    this.lightNeeded = phaseConfig[this.phase].lightNeeded;
    scene.add.existing(this);
  }

  grow() {
    if (this.phase >= 2) return;
    this.phase = (this.phase + 1) as Phase;
    let { waterNeeded, fertilizerNeeded, lightNeeded } =
      phaseConfig[this.phase];
    this.waterNeeded = waterNeeded;
    this.fertilizerNeeded = fertilizerNeeded;
    this.lightNeeded = lightNeeded;
  }

  reset() {
    this.phase = 0;
    const config = phaseConfig[0];
    this.waterNeeded = config.waterNeeded;
    this.fertilizerNeeded = config.fertilizerNeeded;
    this.lightNeeded = config.lightNeeded;
    this.setFrame(0);
  }

  die(onComplete: () => void) {
    this.setTint(0xff2222);
    this.scene.tweens.add({
      targets: this,
      alpha: 0.2,
      duration: 180,
      yoyo: true,
      repeat: 3,
      onComplete: () => {
        this.clearTint();
        this.setAlpha(1);
        this.reset();
        onComplete();
      },
    });
  }

  update() {}
}
