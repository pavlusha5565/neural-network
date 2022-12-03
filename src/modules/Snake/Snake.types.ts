import { EDirection, T2DCoord } from "../../utils/global.types";

export enum EHitEvent {
  wall = "wall",
  snake = "snake",
  apple = "apple",
}

export enum EGameState {
  ready = "ready",
  pause = "pause",
  playing = "playing",
  lose = "lose",
  win = "win",
}

export interface ISnakeSetting {
  width: number;
  height: number;
  logger: boolean;
  startSpeed: number;
  score: { lose: number; win: number; apple: number; tick: 1 };
}

export interface ISnake extends Array<T2DCoord> {}

export interface ISnakeStore {
  totalScore: number;
  appleScore: number;
  totalGame: number;
}

export interface ISnakeGame {
  speed: number;
  snake: ISnake;
  direction: EDirection;
  apple: T2DCoord | null;
}
