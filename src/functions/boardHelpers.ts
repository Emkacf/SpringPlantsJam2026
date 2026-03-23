import { FlowerType } from "../Flower";

export function getRandomType(): FlowerType {
  return Math.floor(Math.random() * 3) as FlowerType;
}
