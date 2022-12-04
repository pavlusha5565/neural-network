import {
  EDirection,
  T2DCoord,
  T2DVector,
  TDirectionMatrix,
} from "./global.types";

export function sumArrays(
  arrOne: Array<number>,
  arrTwo: Array<number>
): Array<number | null> {
  return arrOne.map((num, index) => {
    const sum = Number(num + arrTwo[index]);
    if (Number.isNaN(sum)) return null;
    return sum;
  });
}

export function calculateVector(
  point: T2DCoord,
  target: T2DCoord,
  isModule: boolean = false
): T2DCoord {
  const [px, py] = point;
  const [tx, ty] = target;
  const vector: T2DCoord = [tx - px, ty - py];
  return isModule ? [Math.abs(vector[0]), Math.abs(vector[1])] : vector;
}

function lengthVector(vector: T2DVector): number {
  return Math.sqrt(vector[0] * vector[0] + vector[1] * vector[1]);
}

export function normalizeVector(vector: T2DVector): T2DVector {
  const length = lengthVector(vector);
  const inverseLength = 1 / length;
  return [vector[0] * inverseLength, vector[1] * inverseLength];
}

export function vectorDistance(vector: T2DVector): number {
  return Math.sqrt(Math.pow(vector[0], 2) + Math.pow(vector[1], 2));
}

export function directionToVector(direction: EDirection) {
  const vectorDirection: T2DVector = [0, 0];
  if (direction === EDirection.up) vectorDirection[1] = 1;
  if (direction === EDirection.down) vectorDirection[1] = -1;
  if (direction === EDirection.right) vectorDirection[0] = 1;
  if (direction === EDirection.left) vectorDirection[0] = -1;
  return vectorDirection;
}

// [TOP, RIGHT, BOTTOM, LEFT]
export function vectorToBoolArray(vector: T2DVector): TDirectionMatrix {
  return [vector[1] > 0, vector[0] > 0, vector[1] < 0, vector[0] < 0].map(
    (bool) => Number(bool)
  ) as TDirectionMatrix;
}

function indexOfMax(arr: number[]) {
  if (arr.length === 0) {
    return -1;
  }

  var max = arr[0];
  var maxIndex = 0;

  for (var i = 1; i < arr.length; i++) {
    if (arr[i] > max) {
      maxIndex = i;
      max = arr[i];
    }
  }

  return maxIndex;
}

export function boolArrayToDirection(
  matrix: TDirectionMatrix | null
): EDirection {
  if (!matrix) return EDirection.up;
  const index = indexOfMax(matrix);
  if (index === 0) return EDirection.up;
  if (index === 1) return EDirection.right;
  if (index === 2) return EDirection.down;
  if (index === 3) return EDirection.left;
  return EDirection.up;
}
