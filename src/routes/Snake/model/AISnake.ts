import { makeAutoObservable } from "mobx";
import { layers, losses, sequential, train } from "@tensorflow/tfjs";
import * as tf from "@tensorflow/tfjs";
import {
  directionState,
  IAIBatchData,
  ISnakeAISetting,
  ISnakeCache,
  IStateSpace,
} from "./AISnake.types";
import { EHitEvent, ISnakeGame } from "../../../modules/Snake/Snake.types";
import {
  boolArrayToDirection,
  calculateVector,
  vectorToBoolArray,
} from "../../../utils/math";
import { applyObject } from "../../../utils/objects";
import { EDirection, TDirectionMatrix } from "../../../utils/global.types";
import { ASnake } from "../../../modules/Snake/Snake";

export class AISnake {
  setting: ISnakeAISetting = {
    action_space: 4,
    state_space: 12,
    batch_size: 128,
    layerSizes: [128, 128, 128],
    adamSetting: { learningRate: 0.2 },
    size: { width: 24, height: 24 },
    gamma: 0.01,
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

  AIGenerateModel() {
    const model = sequential();
    const { layerSizes } = this.setting;

    model.add(
      layers.dense({
        units: layerSizes[0],
        inputShape: [12],
        activation: "relu",
      })
    );

    for (let index = 1; index < layerSizes.length; index++) {
      model.add(
        layers.dense({
          units: layerSizes[index],
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
      optimizer: train.adam(this.setting.adamSetting.learningRate),
      loss: losses.meanSquaredError,
      metrics: ["accuracy", "mse"],
    });

    this.cache.model = model;
  }

  generateState(snakeEngine: ASnake): tf.Tensor {
    const snakeHead: [number, number] = snakeEngine.game.snake[0];
    const snakeVector = snakeEngine.snakeMoveVector;
    const appleVector = snakeEngine.appleVector || [0, 0];

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
      [1, 12]
    );
  }

  makeTrainBatch(steps: number): IAIBatchData[] {
    if (!this.snakeEngine) return [];
    const batch = [];
    this.snakeEngine.restart();

    for (let step = 0; step < steps; step++) {
      // generate state of apple, wall and snake vectors (Shape [-1,1])
      const stateTesor = this.generateState(this.snakeEngine);

      // generate prediction on each step
      const predict = this.predict(stateTesor) as tf.Tensor;

      // parse prediction direction of number*4[] to EDirection enum
      const nextMove = boolArrayToDirection(
        // @ts-ignore
        predict?.arraySync()[0] as TDirectionMatrix
      );

      // set direction and run snake step.
      this.snakeEngine.setDirection(nextMove);
      const moveData = this.snakeEngine.step();

      // умножаем вычесленные веса направлений на общее количество
      //   очков после хода(пересчитывается каждый ход) и скармливаем
      //   как целевые значение для обучения
      const rewards = tf.scalar(moveData.score.totalScore * this.setting.gamma);
      const rewardsTrain = tf.add(predict, rewards);

      // State for train
      batch.push({
        data: stateTesor,
        predict: predict,
        moveTo: nextMove,
        rewards: rewardsTrain,
      });

      if (moveData.hit === EHitEvent.snake || moveData.hit === EHitEvent.wall) {
        break;
      }
    }
    return batch;
  }

  async trainBatch(batch: IAIBatchData[]) {
    // Make single tensor
    let trainData = batch.map((i) => i.data);
    const trainTensor = tf.concat(trainData, 0).reshape([batch.length, 12]);

    // Make single tensor
    const rewards = batch.map((i) => i.rewards);
    const rewardsTensor = tf.concat(rewards, 0).reshape([batch.length, 4]);

    // Fit model
    await this.model?.fit(trainTensor, rewardsTensor, {
      callbacks: {
        onBatchEnd: (...logs) => {
          console.log(logs);
        },
      },
    });
  }

  predict(tensor: tf.Tensor): tf.Tensor | null {
    if (this.model) {
      return this.model.predict(tensor) as tf.Tensor;
    }
    return null;
  }

  get model() {
    return this.cache.model;
  }
}
