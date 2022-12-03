// [X,Y] coordinate
export type T2DCoord = [number, number];

// [X,Y,Z] coordinate
export type T3DCoord = [number, number, number];

// [X,Y] direction;
export type T2DVector = [number, number];

export type TDirectionMatrix = [number, number, number, number];

export enum EDirection {
  up = "up",
  down = "down",
  left = "left",
  right = "right",
}
