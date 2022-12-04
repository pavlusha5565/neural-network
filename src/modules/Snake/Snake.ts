import { action, computed, makeObservable, observable } from "mobx";
import { IActorSetting } from "../Actor/Actor.types";
import {
  EGameState,
  EHitEvent,
  ISnakeGame,
  ISnakeSetting,
  ISnakeStore as ISnakeScore,
} from "./Snake.types";
import { cloneDeep, random } from "lodash";
import {
  calculateVector,
  directionToVector,
  normalizeVector,
  sumArrays,
} from "../../utils/math";
import { applyObject } from "../../utils/objects";
import AActor from "../Actor/Actor";
import { EDirection, T2DCoord } from "../../utils/global.types";

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
    win: 100,
    lose: 50,
    apple: 5,
    step: 1,
  },
};

const gameDefault: ISnakeGame = {
  snake: [[0, 0]],
  speed: 1,
  apple: [5, 5],
  direction: EDirection.down,
};

const scoreDefault: ISnakeScore = {
  totalScore: 0,
  appleScore: 0,
  totalGame: 0,
};

export class ASnake extends AActor {
  setting: ISnakeSetting = settingDefault;
  game: ISnakeGame = gameDefault;
  score: ISnakeScore = scoreDefault;
  state: EGameState = EGameState.ready;
  timeStore: { [key: string]: number } = {};
  autoPlayData: EDirection[] = [];

  constructor(setting: Partial<ISnakeSetting> = {}) {
    super(defaultActoreSetting);
    applyObject(this.setting, setting);

    makeObservable(this, {
      setting: observable,
      game: observable,
      score: observable,
      state: observable,
      autoPlayData: observable,
      makeGame: action,
      makeSnake: action,
      makeApple: action,
      start: action,
      startAI: action,
      stop: action,
      restart: action,
      resume: action,
      eatApple: action,
      endGame: action,
      move: action,
      setDirection: action,
      appleVector: computed,
      snakeMoveVector: computed,
      setAutoplayData: action,
    });

    // @ts-ignore
    window.snake = this;

    this.makeGame();
  }

  public static generate2DCoord(width: number, height: number): T2DCoord {
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

  get appleVector(): T2DCoord | null {
    if (!this.game.apple) return null;
    const head = this.game.snake[0];
    const apple = this.game.apple;

    return calculateVector(head, apple);
  }

  get snakeMoveVector(): T2DCoord {
    const direction = this.game.direction;
    const vector = directionToVector(direction);
    return vector;
  }

  checkSettings(): void {
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

  get playground(): Array<Array<T2DCoord>> {
    const playgroundMatrix: Array<Array<T2DCoord>> = [];
    for (let x = 0; x < this.setting.width; x++) {
      for (let y = 0; y < this.setting.height; y++) {
        if (!playgroundMatrix[x]) playgroundMatrix[x] = [];
        playgroundMatrix[x][y] = [x, y] as T2DCoord;
      }
    }
    return playgroundMatrix;
  }

  makeGame(): void {
    this.game = { ...gameDefault, speed: this.setting.startSpeed };

    this.makeSnake();
    this.makeApple();

    this.score.appleScore = 0;

    this.state = EGameState.ready;
    this.logger("Init game");
  }

  makeSnake(): void {
    this.game.snake = [[this.setting.width / 2, this.setting.height / 2]];
    this.logger("generated snake: " + JSON.stringify(this.game.snake));
  }

  makeApple(): void {
    let interation = 0;
    while (interation < 256) {
      interation++;
      const rundCoord: T2DCoord = ASnake.generate2DCoord(
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

  start(): void {
    this.logger("Start game");
    this.makeGame();
    this.state = EGameState.playing;
    this.StartActorTick();
  }

  startAI(): void {
    this.logger("Start ai game");
    this.makeGame();
    this.state = EGameState.autoplay;
    this.StartActorTick();
  }

  stop(): void {
    this.logger("Stop game");
    this.state = EGameState.pause;
    this.StopActorTick();
  }

  resume(): void {
    this.logger("Resume game");
    this.state = EGameState.playing;
    this.StartActorTick();
  }

  restart(): void {
    this.logger("Restart game");
    this.StopActorTick();
    this.makeGame();
  }

  endGame(state: EGameState): void {
    this.state = state;
    if (state === EGameState.lose) {
      this.score.totalScore -= this.setting.score.lose;
      if (this.score.totalScore < 0) this.score.totalScore = 0;
    }
    if (state === EGameState.win) {
      this.score.totalScore += this.setting.score.win;
    }

    this.score.totalGame += 1;
    this.restart();

    this.logger("*****************");
    this.logger("End game(" + state + ")");
    this.logger("Score: " + this.score.totalScore);
    this.logger("Game: " + this.score.totalGame);
    this.logger("Apple: " + this.score.appleScore);
    this.logger("*****************");
  }

  eatApple(): void {
    this.score.appleScore += 1;
    this.score.totalScore += this.setting.score.apple;

    if (this.setting.width * this.setting.height <= this.game.snake.length) {
      this.endGame(EGameState.win);
      return;
    }

    this.logger("*****************");
    this.logger("Score: " + this.score.totalScore);
    this.logger("Apple: " + this.score.appleScore);
    this.logger("*****************");
  }

  move(): { position: T2DCoord; hit: EHitEvent | null } {
    const snake = [...this.game.snake];

    const deltaPosition: T2DCoord = this.snakeMoveVector;
    const snakeHead: T2DCoord = snake[0];
    const nextPosition = sumArrays(snakeHead, deltaPosition) as T2DCoord;
    const hit = this.checkHit(nextPosition);

    snake.unshift(nextPosition);
    if (hit === EHitEvent.apple) {
      this.eatApple();
      this.makeApple();

      this.game.snake = snake;
      this.logger("hit: " + EHitEvent.apple);
      return { position: nextPosition, hit };
    }

    if (hit === EHitEvent.snake || hit === EHitEvent.wall) {
      this.endGame(EGameState.lose);
      this.logger("hit: " + hit);
      return { position: nextPosition, hit };
    }

    const snakeVector = this.snakeMoveVector;
    const appleVector = calculateVector(
      nextPosition,
      this.game.apple || [0, 0]
    );
    const normAppleVector = normalizeVector(appleVector || [0, 0]).map((i) =>
      i > 0 ? 1 : i === 0 ? 0 : -1
    );
    if (
      snakeVector[0] === normAppleVector[0] ||
      snakeVector[1] === normAppleVector[1]
    ) {
      this.score.totalScore += this.setting.score.step;
    }

    snake.pop();

    this.game.snake = snake;
    return { position: nextPosition, hit };
  }

  setDirection(direction: EDirection): void {
    if (direction === EDirection.up || direction === EDirection.down) {
      if (
        this.game.direction === EDirection.up ||
        this.game.direction === EDirection.down
      ) {
        return;
      }
    }
    if (direction === EDirection.left || direction === EDirection.right) {
      if (
        this.game.direction === EDirection.left ||
        this.game.direction === EDirection.right
      ) {
        return;
      }
    }
    this.game.direction = direction;
  }

  public keyBind(element: HTMLElement): () => void {
    const listner = (event: KeyboardEvent) => {
      switch (event.key) {
        case "ArrowDown":
          this.setDirection(EDirection.down);
          break;
        case "ArrowUp":
          this.setDirection(EDirection.up);
          break;
        case "ArrowLeft":
          this.setDirection(EDirection.left);
          break;
        case "ArrowRight":
          this.setDirection(EDirection.right);
          break;
        case " ":
          if (this.state === EGameState.pause) {
            this.resume();
          } else if (this.state === EGameState.playing) {
            this.stop();
          }
          break;
        case "Enter":
          this.start();
          break;
      }
    };

    element.addEventListener("keydown", listner);

    return () => element.removeEventListener("keydown", listner);
  }

  public logger(msg: string, type: "log" | "error" | "warn" = "log") {
    if (this.setting.logger) {
      console[type](msg);
    }
  }

  public step(callback?: () => void): {
    game: ISnakeGame;
    score: ISnakeScore;
    hit: EHitEvent | null;
  } {
    const { hit } = this.move();
    callback?.();
    return { game: this.game, score: this.score, hit };
  }

  public setAutoplayData(direction: EDirection[]) {
    this.autoPlayData = direction;
  }

  public override tick(deltaTime: number) {
    const interval = 1000 / this.game.speed || 1;
    if (!this.timeStore.moveInterval) {
      this.timeStore.moveInterval = 0;
    }

    if (this.state === EGameState.playing) {
      this.timeStore.moveInterval += deltaTime;
      if (this.timeStore.moveInterval > interval) {
        this.move();
        this.timeStore.moveInterval -= interval;
      }
    }

    if (this.state === EGameState.autoplay) {
      this.timeStore.moveInterval += deltaTime;
      if (this.timeStore.moveInterval > interval) {
        const autoPlayData = this.autoPlayData;
        this.setDirection(autoPlayData[0]);

        this.move();

        autoPlayData.shift();
        this.autoPlayData = autoPlayData;
        if (autoPlayData.length <= 0) {
          this.restart();
        }

        this.timeStore.moveInterval -= interval;
      }
    }
  }
}
