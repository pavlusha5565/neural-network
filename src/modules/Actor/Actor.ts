import { makeObservable, observable, action, reaction } from "mobx";
import { IActorSetting } from "./Actor.types";

export default class AActor {
  tickRefrence: NodeJS.Timeout | string | number | undefined;
  oldTime: Date = new Date();
  options: IActorSetting = {
    name: "Actor",
    tickInterval: 0,
    bActorTicking: false,
  };

  constructor(options?: Partial<IActorSetting>) {
    if (options) {
      this.options = { ...this.options, ...options };
    }

    makeObservable(this, {
      options: observable,
      updateOptions: action,
    });

    reaction(
      () => this.options,
      () => {
        console.log(`Update options (${this.options.name})`);
        this.onActorInit();
      }
    );

    this.beginPlay();
  }

  private clearInteraval() {
    clearInterval(this.tickRefrence);
    this.tickRefrence = undefined;
  }

  private onActorInit() {
    this.clearInteraval();
    if (this.options.bActorTicking) {
      this.oldTime = new Date();
      this.tickRefrence = setInterval(
        this.actorTick.bind(this),
        this.options.tickInterval
      );
      this.actorTick();
    }
  }

  private onActorDestroy() {
    this.clearInteraval();
  }

  private actorTick() {
    const currentDate = new Date();
    const delta = currentDate.getTime() - this.oldTime.getTime();
    this.oldTime = currentDate;
    this.tick(delta);
  }

  // service function
  public updateOptions(newOptions: Partial<IActorSetting>) {
    const options: IActorSetting = { ...this.options, ...newOptions };
    this.options = options;
  }

  // Start actor ticking manualy
  public StartActorTick(): void {
    this.options.bActorTicking = true;
    this.onActorInit();
  }

  // Stop actor ticking manualy
  public StopActorTick(): void {
    this.options.bActorTicking = false;
    this.clearInteraval();
  }

  // override functions

  public beginPlay(): void {}
  public tick(deltaTime: number): void {}
  public destroy(): void {
    this.onActorDestroy();
  }
}
