import { makeObservable, action, observable } from "mobx";
import {
  ICacheCarsStore,
  ICarsResponse,
  IDenseLayerArgs,
  IFormatDataField,
  IFormatedData,
  ITensoredCarsData,
  ITrainModelConfig,
} from "./AICars.types";
import {
  layers,
  linspace,
  losses,
  Sequential,
  sequential,
  Tensor,
  tensor2d,
  tidy,
  train,
  util,
} from "@tensorflow/tfjs";

const cacheDefault: ICacheCarsStore = {
  data: [],
  model: null,
  tenzorData: null,
  layers: [],
  labels: { xLabel: "X Axis", yLabel: "Y Axis" },
};

export class AICars {
  data: ICarsResponse[] | null = null;
  cache: ICacheCarsStore = cacheDefault;

  constructor() {
    makeObservable(this, {
      data: observable,
      fetchCarsData: action,
      formatData: action,
      AIGenerateModel: action,
      convertToTensor: action,
    });
  }

  formatData(
    { x: xField, y: yField, xLabel, yLabel }: IFormatDataField,
    filter = false
  ): IFormatedData[] {
    if (!this.data) throw new Error("Empty data storage");
    let data = this.data.map((car) => ({
      x: Number(car[xField]),
      y: Number(car[yField]),
    }));

    if (filter) {
      data = data.filter((car) => {
        if (car.x === null || car.y === null) return true;
        if (Number.isNaN(car.x) || Number.isNaN(car.y)) return true;
        return false;
      });
    }

    this.cache.data = data;
    this.cache.labels = { xLabel, yLabel };
    return data;
  }

  AIGenerateModel(modelLayersSetup: IDenseLayerArgs[]): Sequential {
    const model = sequential();

    modelLayersSetup.forEach((layer: IDenseLayerArgs) => {
      model.add(layers.dense(layer));
    });

    this.cache.layers = modelLayersSetup;
    this.cache.model = model;
    // @ts-ignore:next-line
    window.model = model;
    return model;
  }

  /**
   * Convert the input data to tensors that we can use for machine
   * learning. We will also do the important best practices of _shuffling_
   * the data and _normalizing_ the data on the y-axis.
   */
  convertToTensor(data: IFormatedData[]): ITensoredCarsData {
    return tidy(() => {
      //Step 1. Shaffle data
      util.shuffle(data);

      const inputs = data.map((d) => d.x);
      const labels = data.map((d) => d.y);

      // Step 2. Tenzor data;
      const inputTensor = tensor2d(inputs, [inputs.length, 1]);
      const labelTensor = tensor2d(labels, [labels.length, 1]);

      //Step 3. Normalize the data to the range 0 - 1 using min-max scaling
      const inputMax = inputTensor.max();
      const inputMin = inputTensor.min();
      const labelMax = labelTensor.max();
      const labelMin = labelTensor.min();

      const normalizedInputs = inputTensor
        .sub(inputMin)
        .div(inputMax.sub(inputMin));
      const normalizedLabels = labelTensor
        .sub(labelMin)
        .div(labelMax.sub(labelMin));

      const tenzorData = {
        inputs: normalizedInputs,
        labels: normalizedLabels,
        // Return the min/max bounds so we can use them later.
        inputMax,
        inputMin,
        labelMax,
        labelMin,
      };

      this.cache.tenzorData = tenzorData;

      return tenzorData;
    });
  }

  // Prepare the model for training.
  async trainModel(
    model: Sequential,
    inputs: ITensoredCarsData["inputs"],
    labels: ITensoredCarsData["labels"],
    fitCallbacks?: any,
    config?: ITrainModelConfig
  ) {
    model.compile({
      optimizer: train.adam(),
      loss: losses.meanSquaredError,
      metrics: ["mse"],
    });

    const batchSize = config?.batchSize || 25;
    const epochs = config?.epochs || 80;

    return await model.fit(inputs, labels, {
      batchSize,
      epochs,
      shuffle: config?.shuffle || true,
      callbacks: fitCallbacks(),
    });
  }

  drawPredictions(
    model: Sequential,
    inputData: IFormatedData[],
    normalizationData: ITensoredCarsData
  ) {
    const { inputMax, inputMin, labelMin, labelMax } = normalizationData;

    const [xs, preds] = tidy(() => {
      const xs = linspace(0, 1, 100);
      const preds = model.predict(xs.reshape([100, 1])) as Tensor;

      const unNormXs = xs.mul(inputMax.sub(inputMin)).add(inputMin);

      const unNormPreds = preds.mul(labelMax.sub(labelMin)).add(labelMin);

      return [unNormXs.dataSync(), unNormPreds.dataSync()];
    });

    const predictedPoints = Array.from(xs).map((val, i) => {
      return { x: val, y: preds[i] };
    });

    const originalPoints = inputData.map((d) => ({
      x: d.x,
      y: d.y,
    }));

    return [originalPoints, predictedPoints];
  }

  reset() {
    this.cache = cacheDefault;
  }

  checkData(): boolean {
    if (!this.data) return false;
    if (this.data.length === 0) return false;
    return true;
  }

  async fetchCarsData(): Promise<ICarsResponse[]> {
    // const carsDataResponse = await fetch(
    //   "https://storage.googleapis.com/tfjs-tutorials/carsData.json"
    // );
    // const carsData = carsDataResponse.json();

    this.data = require("../CarsData.json") as ICarsResponse[];
    return this.data;
  }
}
