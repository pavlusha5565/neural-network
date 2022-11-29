import { makeAutoObservable } from "mobx";
import { IActorSetting } from "../Actor/Actor.types";
import {
  EGameState,
  EHitEvent,
  ESnakeDirection,
  ISnakeGame,
  ISnakeSetting,
  ISnakeStore,
  T2DCoord,
} from "./Snake.types";
import { random } from "lodash";
import { sumArrays } from "../../utils/math";
import { applyObject } from "../../utils/objects";
import AActor from "../Actor/Actor";

const defaultActoreSetting: IActorSetting = {
  name: "ASnake Actor",
  bActorTicking: false,
  tickInterval: 10,
};

const settingDefault: ISnakeSetting = {
  width: 12,
  height: 12,
  startSpeed: 1,
  logger: false,
  score: {
    win: 500,
    lose: 100,
    apple: 5,
  },
};

const gameDefault: ISnakeGame = {
  snake: [[0, 0]],
  speed: 1,
  apple: [5, 5],
  direction: ESnakeDirection.down,
};

const storeDefault: ISnakeStore = {
  totalScore: 0,
  appleScore: 0,
  totalGame: 0,
};

export class ASnake {
  setting: ISnakeSetting = settingDefault;
  game: ISnakeGame = gameDefault;
  store: ISnakeStore = storeDefault;
  state: EGameState = EGameState.ready;

  constructor(setting: Partial<ISnakeSetting> = {}) {
    applyObject(this.setting, setting);

    makeAutoObservable(this);

    this.makeGame();
  }

  public static generateCoordinate(width: number, height: number): T2DCoord {
    return [random(0, width - 1), random(0, height - 1)];
  }

  public static checkEqualPosition(
    targetOne: T2DCoord | null,
    targetTwo: T2DCoord | null
  ) {
    return (
      targetOne?.[0] === targetTwo?.[0] && targetOne?.[1] === targetTwo?.[1]
    );
  }

  checkSettings() {
    const setting = this.setting;
    if (setting.width < 6 || setting.height < 6) {
      this.logger("Snake playground size in wrong. Reset to minimal", "warn");
      setting.width = 6;
      setting.height = 6;
    }
    if (setting.startSpeed < 0.2) {
      this.logger("Snake startSpeed in wrong. Reset to minimal", "warn");
      setting.startSpeed = 0.2;
    }
  }

  makeGame() {
    this.game = { ...gameDefault, speed: this.setting.startSpeed };

    this.makeSnake();
    this.makeApple();

    this.state = EGameState.ready;
    this.logger("Init game");
  }

  makeSnake() {
    this.game.snake = [[this.setting.width / 2, this.setting.height / 2]];
  }

  makeApple() {
    if (this.setting.width * this.setting.height >= this.game.snake.length) {
      this.endGame(EGameState.win);
      return;
    }

    let interation = 0;
    while (interation < 128) {
      const rundCoord: T2DCoord = ASnake.generateCoordinate(
        this.setting.width,
        this.setting.height
      );
      if (!this.checkHit(rundCoord)) {
        this.game.apple = rundCoord;
        break;
      }
    }

    this.logger("generated apple: " + JSON.stringify(this.game.apple));
  }

  checkHit(position: T2DCoord): EHitEvent | null {
    const [x, y] = position;
    const game = this.game;

    if (x < 0 || x >= this.setting.width) {
      return EHitEvent.wall;
    }
    if (y < 0 || y >= this.setting.width) {
      return EHitEvent.wall;
    }

    if (game.apple) {
      if (ASnake.checkEqualPosition(game.apple, position)) {
        return EHitEvent.apple;
      }
    }

    const hitSnake = game.snake.some((snakeFragment) =>
      ASnake.checkEqualPosition(snakeFragment, position)
    );
    if (hitSnake) {
      return EHitEvent.snake;
    }

    return null;
  }

  start() {
    this.logger("Start game");
    this.makeGame();
    this.state = EGameState.playing;
  }

  stop() {
    this.logger("Stop game");
    this.state = EGameState.pause;
  }

  resume() {
    this.logger("Resume game");
    this.state = EGameState.playing;
  }

  restart() {
    this.logger("Restart game");
    this.stop();
    this.makeGame();
  }

  endGame(state: EGameState) {
    this.state = state;
    if (state === EGameState.lose) {
      this.store.totalScore -= this.setting.score.lose;
      if (this.store.totalScore < 0) this.store.totalScore = 0;
    }
    if (state === EGameState.win) {
      this.store.totalScore += this.setting.score.win;
    }
    this.restart();

    this.logger("*****************");
    this.logger("End game(" + state + ")");
    this.logger("Score: " + this.store.totalScore);
    this.logger("Game: " + this.store.totalGame);
    this.logger("Apple: " + this.store.appleScore);
    this.logger("*****************");
  }

  eatApple() {
    this.store.appleScore += 1;
    this.store.totalScore += this.setting.score.apple;

    this.logger("*****************");
    this.logger("Score: " + this.store.totalScore);
    this.logger("Apple: " + this.store.appleScore);
    this.logger("*****************");
  }

  move() {
    const direction = this.game.direction;
    const snake = [...this.game.snake];
    const deltaPosition: T2DCoord = [
      direction === ESnakeDirection.up
        ? -1
        : direction === ESnakeDirection.down
        ? 1
        : 0,
      direction === ESnakeDirection.right
        ? 1
        : direction === ESnakeDirection.left
        ? -1
        : 0,
    ];

    const snakeHead: T2DCoord = snake[0];
    const nextPosition = sumArrays(snakeHead, deltaPosition) as T2DCoord;
    const hit = this.checkHit(nextPosition);

    snake.unshift(nextPosition);
    if (hit === EHitEvent.apple) {
      this.eatApple();
      this.makeApple();

      this.game.snake = snake;
      this.logger("hit: " + EHitEvent.apple);
      return;
    }

    if (hit === EHitEvent.snake || hit === EHitEvent.wall) {
      this.endGame(EGameState.lose);
      this.logger("hit: " + EHitEvent.wall);
      return;
    }

    snake.pop();
    this.game.snake = snake;
  }

  direction(direction: ESnakeDirection) {
    if (
      direction === ESnakeDirection.up ||
      direction === ESnakeDirection.down
    ) {
      if (
        this.game.direction === ESnakeDirection.up ||
        this.game.direction === ESnakeDirection.down
      ) {
        return;
      }
    }
    if (
      direction === ESnakeDirection.left ||
      direction === ESnakeDirection.right
    ) {
      if (
        this.game.direction === ESnakeDirection.left ||
        this.game.direction === ESnakeDirection.right
      ) {
        return;
      }
    }
    this.game.direction = direction;
  }

  keyBind(element: HTMLElement) {
    element.addEventListener("keydown", (event) => {
      switch (event.key) {
        case "ArrowDown":
          this.direction(ESnakeDirection.down);
          break;
        case "ArrowUp":
          this.direction(ESnakeDirection.up);
          break;
        case "ArrowLeft":
          this.direction(ESnakeDirection.left);
          break;
        case "ArrowRight":
          this.direction(ESnakeDirection.right);
          break;
        case "Space":
          if (this.state === EGameState.pause) this.resume();
          if (this.state === EGameState.playing) this.stop();
          break;
        case "Enter":
          if (this.state === EGameState.pause) this.start();
          break;
      }
    });
  }

  logger(msg: string, type: "log" | "error" | "warn" = "log") {
    if (this.setting.logger) {
      console[type](msg);
    }
  }
}
