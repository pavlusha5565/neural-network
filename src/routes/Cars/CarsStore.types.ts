import { Rank, Sequential, Shape, Tensor } from "@tensorflow/tfjs";
import { DenseLayerArgs } from "@tensorflow/tfjs-layers/dist/layers/core";

export interface ICarsResponse {
  [key: string]: number | string | null;
}

export interface IFormatedData {
  x: number;
  y: number;
}

export interface IFormatDataField {
  x: string;
  y: string;
  xLabel: string;
  yLabel: string;
}

export interface ITensoredCarsData {
  inputs: Tensor<Rank>;
  labels: Tensor<Rank>;
  inputMax: Tensor<Rank>;
  inputMin: Tensor<Rank>;
  labelMax: Tensor<Rank>;
  labelMin: Tensor<Rank>;
}

export interface ITrainModelConfig {
  batchSize: number;
  epochs: number;
  shuffle: boolean;
}

export interface ICacheCarsStore {
  data: IFormatedData[];
  model: Sequential | null;
  tenzorData: ITensoredCarsData | null;
  layers: IDenseLayerArgs[];
  labels: {
    xLabel: string;
    yLabel: string;
  };
}

export interface IDenseLayerArgs {
  units: DenseLayerArgs["units"];
  batchSize: DenseLayerArgs["batchSize"];
  inputShape: DenseLayerArgs["inputShape"];
  useBias: DenseLayerArgs["useBias"];
}
