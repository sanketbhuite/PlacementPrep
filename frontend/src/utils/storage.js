// Tiny wrapper so we can swap to real APIs later.
export const storage = {
  get(key, fallback = null) {
    try {
      const v = localStorage.getItem(key);
      return v ? JSON.parse(v) : fallback;
    } catch {
      return fallback;
    }
  },
  set(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  },
  push(key, item) {
    const arr = storage.get(key, []);
    arr.push(item);
    storage.set(key, arr);
  },
};
