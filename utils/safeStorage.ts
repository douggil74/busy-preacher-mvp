class SafeStorage {
  private storage: Map<string, string> = new Map();
  private isAvailable: boolean = false;

  constructor() {
    try {
      const test = '__test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      this.isAvailable = true;
    } catch (e) {
      this.isAvailable = false;
    }
  }

  getItem(key: string): string | null {
    if (this.isAvailable) {
      try {
        return localStorage.getItem(key);
      } catch (e) {
        return this.storage.get(key) || null;
      }
    }
    return this.storage.get(key) || null;
  }

  setItem(key: string, value: string): void {
    if (this.isAvailable) {
      try {
        localStorage.setItem(key, value);
        return;
      } catch (e) {}
    }
    this.storage.set(key, value);
  }

  removeItem(key: string): void {
    if (this.isAvailable) {
      try {
        localStorage.removeItem(key);
        return;
      } catch (e) {}
    }
    this.storage.delete(key);
  }

  clear(): void {
    if (this.isAvailable) {
      try {
        localStorage.clear();
      } catch (e) {}
    }
    this.storage.clear();
  }
}

export const safeStorage = new SafeStorage();
