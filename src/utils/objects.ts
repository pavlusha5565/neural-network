export interface objectShape<T> {
  [key: string]: T;
}

export function applyObject<T extends object>(
  source: T,
  target: Partial<T>
): T {
  for (let key in target) {
    source[key] = target[key] as T[Extract<keyof T, string>];
  }
  return source;
}
