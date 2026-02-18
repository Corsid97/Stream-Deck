import * as fs from 'fs';
import * as path from 'path';
import { app } from 'electron';
import { createDefaultProfile, createDefaultSettings } from '../shared/types';
import type { Profile, AppSettings } from '../shared/types';

export class DataStore {
  private data: Record<string, unknown>;
  private filePath: string;

  constructor() {
    const userDataPath = app.getPath('userData');
    this.filePath = path.join(userDataPath, 'deckforge-data.json');
    this.data = this.loadFromDisk();
    this.ensureDefaults();
  }

  private loadFromDisk(): Record<string, unknown> {
    try {
      if (fs.existsSync(this.filePath)) {
        const raw = fs.readFileSync(this.filePath, 'utf-8');
        return JSON.parse(raw);
      }
    } catch (err) {
      console.error('Failed to load data store:', err);
    }
    return {};
  }

  private saveToDisk(): void {
    try {
      const dir = path.dirname(this.filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(this.filePath, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to save data store:', err);
    }
  }

  private ensureDefaults(): void {
    if (!this.data.settings) {
      const defaultProfile = createDefaultProfile();
      const defaultSettings = createDefaultSettings();
      defaultSettings.activeProfileId = defaultProfile.id;

      this.data.settings = defaultSettings;
      this.data.profiles = [defaultProfile];
      this.saveToDisk();
    }
  }

  get(key: string): unknown {
    const keys = key.split('.');
    let current: unknown = this.data;
    for (const k of keys) {
      if (current && typeof current === 'object' && k in (current as Record<string, unknown>)) {
        current = (current as Record<string, unknown>)[k];
      } else {
        return undefined;
      }
    }
    return current;
  }

  set(key: string, value: unknown): void {
    const keys = key.split('.');
    if (keys.length === 1) {
      this.data[key] = value;
    } else {
      let current: Record<string, unknown> = this.data;
      for (let i = 0; i < keys.length - 1; i++) {
        if (!(keys[i] in current) || typeof current[keys[i]] !== 'object') {
          current[keys[i]] = {};
        }
        current = current[keys[i]] as Record<string, unknown>;
      }
      current[keys[keys.length - 1]] = value;
    }
    this.saveToDisk();
  }

  delete(key: string): void {
    const keys = key.split('.');
    if (keys.length === 1) {
      delete this.data[key];
    } else {
      let current: Record<string, unknown> = this.data;
      for (let i = 0; i < keys.length - 1; i++) {
        if (!(keys[i] in current)) return;
        current = current[keys[i]] as Record<string, unknown>;
      }
      delete current[keys[keys.length - 1]];
    }
    this.saveToDisk();
  }

  getProfiles(): Profile[] {
    return (this.data.profiles as Profile[]) || [];
  }

  getSettings(): AppSettings {
    return this.data.settings as AppSettings;
  }
}
