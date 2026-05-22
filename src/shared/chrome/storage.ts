type StorageValue = unknown;
type StorageValues = Record<string, StorageValue>;
type StorageKeys = string | string[];

const memoryStorage = new Map<string, StorageValue>();

const hasChromeStorage = (): boolean => Boolean(globalThis.chrome?.storage?.local);
const hasBrowserLocalStorage = (): boolean => Boolean(globalThis.localStorage);

const getFallbackStorageValue = (key: string): StorageValue => {
  if (hasBrowserLocalStorage()) {
    const value = globalThis.localStorage.getItem(key);
    return value ? (JSON.parse(value) as StorageValue) : undefined;
  }

  return memoryStorage.get(key);
};

const setFallbackStorageValue = (key: string, value: StorageValue): void => {
  if (hasBrowserLocalStorage()) {
    globalThis.localStorage.setItem(key, JSON.stringify(value));
    return;
  }

  memoryStorage.set(key, value);
};

export const getLocalStorage = <T extends StorageValues = StorageValues>(keys: StorageKeys): Promise<Partial<T>> => {
  if (!hasChromeStorage()) {
    const keyList = Array.isArray(keys) ? keys : [keys];
    return Promise.resolve(
      keyList.reduce<Partial<T>>(
        (result, key) => ({ ...result, [key]: getFallbackStorageValue(key) as T[keyof T] }),
        {},
      ),
    );
  }

  return new Promise<Partial<T>>((resolve, reject) => {
    globalThis.chrome.storage.local.get(keys, (result) => {
      const runtimeError = globalThis.chrome.runtime?.lastError;
      if (runtimeError) {
        reject(new Error(runtimeError.message));
        return;
      }
      resolve((result ?? {}) as Partial<T>);
    });
  });
};

export const setLocalStorage = <T extends StorageValues = StorageValues>(values: T): Promise<void> => {
  if (!hasChromeStorage()) {
    Object.entries(values).forEach(([key, value]) => setFallbackStorageValue(key, value as StorageValue));
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    globalThis.chrome.storage.local.set(values, () => {
      const runtimeError = globalThis.chrome.runtime?.lastError;
      if (runtimeError) {
        reject(new Error(runtimeError.message));
        return;
      }
      resolve();
    });
  });
};
