import { cloneDeep } from "lodash";
import { action, computed, makeObservable, observable } from "mobx";

export class FormManager<T extends object> {
  store: T;

  constructor(initStore: T) {
    this.store = initStore;
    makeObservable(this, {
      store: observable,
      storeData: computed,
      updateStore: action,
      updateField: action,
    });
  }

  get storeData() {
    return cloneDeep(this.store);
  }

  updateStore(callback: (store: T) => T) {
    const nextStore = cloneDeep(this.store);
    this.store = callback(nextStore);
  }

  updateField(field: keyof T, value: any) {
    this.store[field] = value;
  }
}
