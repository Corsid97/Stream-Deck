import { contextBridge, ipcRenderer } from 'electron';
import { IPC_CHANNELS } from '../shared/types';

const electronAPI = {
  // Store
  store: {
    get: (key: string) => ipcRenderer.invoke(IPC_CHANNELS.STORE_GET, key),
    set: (key: string, value: unknown) => ipcRenderer.invoke(IPC_CHANNELS.STORE_SET, key, value),
    delete: (key: string) => ipcRenderer.invoke(IPC_CHANNELS.STORE_DELETE, key),
  },

  // Actions
  actions: {
    execute: (action: { type: string; label: string; params: Record<string, unknown> }) =>
      ipcRenderer.invoke(IPC_CHANNELS.ACTION_EXECUTE, action),
  },

  // Bridge
  bridge: {
    start: () => ipcRenderer.invoke(IPC_CHANNELS.BRIDGE_START),
    stop: () => ipcRenderer.invoke(IPC_CHANNELS.BRIDGE_STOP),
    getStatus: () => ipcRenderer.invoke(IPC_CHANNELS.BRIDGE_STATUS),
  },

  // Plugins
  plugins: {
    list: () => ipcRenderer.invoke(IPC_CHANNELS.PLUGIN_LIST),
    enable: (pluginId: string) => ipcRenderer.invoke(IPC_CHANNELS.PLUGIN_ENABLE, pluginId),
    disable: (pluginId: string) => ipcRenderer.invoke(IPC_CHANNELS.PLUGIN_DISABLE, pluginId),
  },

  // System
  system: {
    openUrl: (url: string) => ipcRenderer.invoke(IPC_CHANNELS.SYSTEM_OPEN_URL, url),
    openApp: (appPath: string) => ipcRenderer.invoke(IPC_CHANNELS.SYSTEM_OPEN_APP, appPath),
    getPlatform: () => ipcRenderer.invoke(IPC_CHANNELS.SYSTEM_PLATFORM),
  },

  // Shortcuts
  shortcuts: {
    onTriggered: (callback: (buttonIndex: number) => void) => {
      const handler = (_event: Electron.IpcRendererEvent, buttonIndex: number) => callback(buttonIndex);
      ipcRenderer.on(IPC_CHANNELS.SHORTCUT_TRIGGERED, handler);
      return () => ipcRenderer.removeListener(IPC_CHANNELS.SHORTCUT_TRIGGERED, handler);
    },
  },

  // Window
  window: {
    minimize: () => ipcRenderer.send(IPC_CHANNELS.WINDOW_MINIMIZE),
    maximize: () => ipcRenderer.send(IPC_CHANNELS.WINDOW_MAXIMIZE),
    close: () => ipcRenderer.send(IPC_CHANNELS.WINDOW_CLOSE),
  },
};

contextBridge.exposeInMainWorld('electronAPI', electronAPI);

export type ElectronAPI = typeof electronAPI;
