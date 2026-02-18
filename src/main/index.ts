import { app, BrowserWindow, ipcMain, globalShortcut, shell, screen } from 'electron';
import * as path from 'path';
import { BridgeServer } from './bridge';
import { ActionExecutor } from './actions';
import { PluginManager } from './plugin-manager';
import { DataStore } from './store';
import { IPC_CHANNELS } from '../shared/types';

let mainWindow: BrowserWindow | null = null;
let bridgeServer: BridgeServer | null = null;
let actionExecutor: ActionExecutor;
let pluginManager: PluginManager;
let dataStore: DataStore;

const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

function createWindow(): void {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;

  mainWindow = new BrowserWindow({
    width: Math.min(1200, width),
    height: Math.min(800, height),
    minWidth: 900,
    minHeight: 600,
    title: 'DeckForge',
    icon: path.join(__dirname, '../../resources/icon.png'),
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
    frame: true,
    backgroundColor: '#0f172a',
    show: false,
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function registerGlobalShortcuts(): void {
  // Register Ctrl+Alt+Shift+1..18 for M18 keyboard mode
  for (let i = 1; i <= 18; i++) {
    const key = i <= 9 ? `${i}` : String.fromCharCode(55 + i); // 10->A, 11->B, etc.
    const accelerator = `CommandOrControl+Alt+Shift+${key}`;

    try {
      globalShortcut.register(accelerator, () => {
        console.log(`Shortcut triggered: Button ${i}`);
        mainWindow?.webContents.send(IPC_CHANNELS.SHORTCUT_TRIGGERED, i);
        actionExecutor.executeButtonActions(i);
      });
    } catch (err) {
      console.warn(`Failed to register shortcut for button ${i}:`, err);
    }
  }
}

function setupIPC(): void {
  // Store operations
  ipcMain.handle(IPC_CHANNELS.STORE_GET, (_event, key: string) => {
    return dataStore.get(key);
  });

  ipcMain.handle(IPC_CHANNELS.STORE_SET, (_event, key: string, value: unknown) => {
    dataStore.set(key, value);
  });

  ipcMain.handle(IPC_CHANNELS.STORE_DELETE, (_event, key: string) => {
    dataStore.delete(key);
  });

  // Action execution
  ipcMain.handle(IPC_CHANNELS.ACTION_EXECUTE, (_event, action) => {
    return actionExecutor.execute(action);
  });

  // Bridge control
  ipcMain.handle(IPC_CHANNELS.BRIDGE_START, () => {
    if (!bridgeServer) {
      const port = dataStore.get('settings.bridgePort') as number || 9271;
      bridgeServer = new BridgeServer(port, actionExecutor);
    }
    return bridgeServer.start();
  });

  ipcMain.handle(IPC_CHANNELS.BRIDGE_STOP, () => {
    return bridgeServer?.stop();
  });

  ipcMain.handle(IPC_CHANNELS.BRIDGE_STATUS, () => {
    return bridgeServer?.getStatus() ?? 'disconnected';
  });

  // Plugin management
  ipcMain.handle(IPC_CHANNELS.PLUGIN_LIST, () => {
    return pluginManager.listPlugins();
  });

  ipcMain.handle(IPC_CHANNELS.PLUGIN_ENABLE, (_event, pluginId: string) => {
    return pluginManager.enablePlugin(pluginId);
  });

  ipcMain.handle(IPC_CHANNELS.PLUGIN_DISABLE, (_event, pluginId: string) => {
    return pluginManager.disablePlugin(pluginId);
  });

  // System operations
  ipcMain.handle(IPC_CHANNELS.SYSTEM_OPEN_URL, (_event, url: string) => {
    return shell.openExternal(url);
  });

  ipcMain.handle(IPC_CHANNELS.SYSTEM_OPEN_APP, (_event, appPath: string) => {
    return shell.openPath(appPath);
  });

  ipcMain.handle(IPC_CHANNELS.SYSTEM_PLATFORM, () => {
    return process.platform;
  });

  // Window controls
  ipcMain.on(IPC_CHANNELS.WINDOW_MINIMIZE, () => {
    mainWindow?.minimize();
  });

  ipcMain.on(IPC_CHANNELS.WINDOW_MAXIMIZE, () => {
    if (mainWindow?.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow?.maximize();
    }
  });

  ipcMain.on(IPC_CHANNELS.WINDOW_CLOSE, () => {
    mainWindow?.close();
  });
}

app.whenReady().then(() => {
  dataStore = new DataStore();
  actionExecutor = new ActionExecutor(dataStore);
  pluginManager = new PluginManager();

  createWindow();
  setupIPC();

  const settings = dataStore.get('settings') as Record<string, unknown> | undefined;
  if (settings?.keyboardModeEnabled !== false) {
    registerGlobalShortcuts();
  }

  if (settings?.bridgeEnabled) {
    const port = (settings.bridgePort as number) || 9271;
    bridgeServer = new BridgeServer(port, actionExecutor);
    bridgeServer.start();
  }

  pluginManager.loadAll();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  globalShortcut.unregisterAll();
  bridgeServer?.stop();
  pluginManager.unloadAll();
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});
