import { makeAutoObservable } from "mobx";
import { layers, losses, sequential, train } from "@tensorflow/tfjs";
import * as tf from "@tensorflow/tfjs";
import {
  directionState,
  ISnakeAISetting,
  ISnakeCache,
  IStateSpace,
} from "./AISnake.types";
import { ISnakeGame } from "../../../modules/Snake/Snake.types";
import { calculateVector, vectorToBoolArray } from "../../../utils/math";
import { applyObject } from "../../../utils/objects";
import { EDirection, T2DVector } from "../../../utils/global.types";
import { ASnake } from "../../../modules/Snake/Snake";

export class AISnake {
  setting: ISnakeAISetting = {
    action_space: 4,
    state_space: 12,
    batch_size: 128,
    layerSizes: [128, 128, 128],
    adamSetting: { learningRate: 0.2 },
    size: { width: 24, height: 24 },
  };
  snakeEngine: ASnake | null = null;

  cache: ISnakeCache = {
    model: null,
  };

  constructor(snakeEngine: ASnake, setting: Partial<ISnakeAISetting>) {
    this.snakeEngine = snakeEngine;
    applyObject(this.setting, setting);

    makeAutoObservable(this);

    // @ts-ignore
    window.aisnake = this;
    // @ts-ignore
    window.tf = tf;
  }

  generateState(): tf.Tensor | null {
    if (!this.snakeEngine) return null;
    const snakeHead: [number, number] = this.snakeEngine.game.snake[0];
    const snakeVector = this.snakeEngine.snakeMoveVector;
    const appleVector = this.snakeEngine.appleVector || [0, 0];
    console.log(appleVector);

    const size = this.setting.size;

    const stateSpace: IStateSpace = {
      apple: vectorToBoolArray(appleVector),
      wall: [
        snakeHead[1] >= size.height - 1,
        snakeHead[0] >= size.width - 1,
        snakeHead[1] <= 0,
        snakeHead[0] <= 0,
      ].map((i) => Number(i)) as directionState,
      snake: vectorToBoolArray(snakeVector),
    };

    return tf.tensor(
      [...stateSpace.apple, ...stateSpace.wall, ...stateSpace.snake],
      [3, 4]
    );
  }

  AIGenerateModel() {
    const model = sequential();
    const { layerSizes } = this.setting;

    for (let index = 0; index < layerSizes.length; index++) {
      const layer = layerSizes[index];
      model.add(
        layers.dense({
          units: layer,
          inputShape: index === 0 ? [this.setting.state_space] : undefined,
          activation: "relu",
        })
      );
    }

    model.add(
      layers.dense({
        units: 4,
        activation: "softmax",
      })
    );

    model.compile({
      optimizer: train.adam(),
      loss: losses.meanSquaredError,
      metrics: ["mse"],
    });

    this.cache.model = model;
  }

  predict(data: ISnakeGame, options: { width: number; height: number }) {
    const tensor = this.generateState();
  }

  get model() {
    return this.cache.model;
  }
}
