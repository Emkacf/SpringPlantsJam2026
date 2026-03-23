import { BoardScene } from "./BoardScene";
import "./style.scss";

import Phaser from "phaser";

const gameBoard = document.createElement("canvas");
document.body.appendChild(gameBoard);

const BOARD_SIZE = {
  width: 630,
  height: 423,
};

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.WEBGL,
  width: BOARD_SIZE.width,
  height: BOARD_SIZE.height,
  canvas: gameBoard,
  scene: [BoardScene],
  scale: {
    zoom: 2,
  },
  backgroundColor: "#ededed",
  pixelArt: true,
  antialias: false,
};

new Phaser.Game(config);
