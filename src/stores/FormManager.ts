import { cloneDeep } from "lodash";
import { autorun, IReactionDisposer, makeAutoObservable, toJS } from "mobx";

export class FormManager<T extends object> {
  store: T;
  disposer: IReactionDisposer | null = null;

  constructor(initStore: T) {
    this.store = initStore || {};
    makeAutoObservable(this);
  }

  get storeData() {
    return cloneDeep(this.store);
  }

  subscribeToChange(callback?: (data: T) => void) {
    const disposer = autorun(() => {
      callback?.(toJS(this.store));
    });
    this.disposer = disposer;
  }

  unsubscribe() {
    this.disposer?.();
    this.disposer = null;
  }

  registerField(field: keyof T, defaultValue: any = "") {
    if (!this.store[field]) {
      this.store[field] = defaultValue;
    }
  }

  updateStore(callback: (store: T) => T) {
    const nextStore = cloneDeep(this.store);
    this.store = callback(nextStore);
  }

  updateField(field: keyof T, value: any) {
    this.registerField(field, value);
    this.store[field] = value;
  }
}
