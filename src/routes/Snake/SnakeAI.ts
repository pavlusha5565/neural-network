import { makeAutoObservable } from "mobx";

export class SnakeAI {
  constructor() {
    makeAutoObservable(this);
  }
}
