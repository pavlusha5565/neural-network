import { AdamOptimizer, Sequential } from "@tensorflow/tfjs";
import { EDirection } from "../../../utils/global.types";

export interface ISnakeAISetting {
  // 4 output layer attribute. Action to up, down, right, left
  action_space: number;
  // 12 input layer attribute
  state_space: number;
  layerSizes: number[];
  batch_size: number;
  epsilon?: number;
  adamSetting: {
    learningRate: number | undefined;
    epsilon?: number | undefined;
    beta1?: number | undefined;
    beta2?: number | undefined;
  };
  size: { width: number; height: number };
}

export interface ISnakeCache {
  model: Sequential | null;
}

export const EActionSpace = {
  [EDirection.up]: 0,
  [EDirection.down]: 1,
  [EDirection.right]: 2,
  [EDirection.left]: 3,
};

// top, right, bottom, left
export type directionState = [number, number, number, number];

export interface IStateSpace {
  apple: directionState;
  wall: directionState;
  snake: directionState;
}
