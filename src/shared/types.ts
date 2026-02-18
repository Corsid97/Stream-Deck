// ===== Action Types =====

export type ActionType =
  | 'open-app'
  | 'close-app'
  | 'open-url'
  | 'insert-text'
  | 'paste-clipboard'
  | 'run-script'
  | 'media-play-pause'
  | 'media-next'
  | 'media-previous'
  | 'media-volume-up'
  | 'media-volume-down'
  | 'media-mute'
  | 'screenshot-full'
  | 'screenshot-window'
  | 'screenshot-region'
  | 'mouse-click'
  | 'mouse-move'
  | 'mouse-scroll'
  | 'window-minimize'
  | 'window-maximize'
  | 'window-focus'
  | 'window-resize'
  | 'display-brightness'
  | 'hotkey';

export interface ActionConfig {
  type: ActionType;
  label: string;
  params: Record<string, unknown>;
}

// ===== Button Types =====

export interface ButtonConfig {
  id: number;
  label: string;
  icon?: string;
  color: string;
  actions: ActionConfig[];
  enabled: boolean;
}

// ===== Page & Profile Types =====

export interface Page {
  id: string;
  name: string;
  buttons: ButtonConfig[];
}

export interface Profile {
  id: string;
  name: string;
  pages: Page[];
  activePageId: string;
}

// ===== Settings Types =====

export interface AppSettings {
  autoStart: boolean;
  minimizeToTray: boolean;
  theme: 'dark' | 'light' | 'system';
  bridgeEnabled: boolean;
  bridgePort: number;
  keyboardModeEnabled: boolean;
  activeProfileId: string;
}

// ===== Bridge Types =====

export type BridgeStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

export interface BridgeConfig {
  port: number;
  host: string;
  autoStart: boolean;
}

export interface BridgeMessage {
  type: string;
  action: string;
  params?: Record<string, unknown>;
  requestId?: string;
}

export interface BridgeResponse {
  requestId?: string;
  success: boolean;
  data?: unknown;
  error?: string;
}

// ===== Plugin Types =====

export type PluginStatus = 'unloaded' | 'loaded' | 'active' | 'error' | 'disabled';

export interface PluginManifest {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  actions?: ActionType[];
}

// ===== IPC Channel Types =====

export const IPC_CHANNELS = {
  // Store
  STORE_GET: 'store:get',
  STORE_SET: 'store:set',
  STORE_DELETE: 'store:delete',

  // Actions
  ACTION_EXECUTE: 'action:execute',

  // Bridge
  BRIDGE_START: 'bridge:start',
  BRIDGE_STOP: 'bridge:stop',
  BRIDGE_STATUS: 'bridge:status',

  // Plugins
  PLUGIN_LIST: 'plugin:list',
  PLUGIN_ENABLE: 'plugin:enable',
  PLUGIN_DISABLE: 'plugin:disable',

  // System
  SYSTEM_OPEN_URL: 'system:open-url',
  SYSTEM_OPEN_APP: 'system:open-app',
  SYSTEM_PLATFORM: 'system:platform',

  // Shortcuts
  SHORTCUT_TRIGGERED: 'shortcut:triggered',
  SHORTCUT_REGISTER: 'shortcut:register',
  SHORTCUT_UNREGISTER: 'shortcut:unregister',

  // Window
  WINDOW_MINIMIZE: 'window:minimize',
  WINDOW_MAXIMIZE: 'window:maximize',
  WINDOW_CLOSE: 'window:close',
} as const;

// ===== Default Data =====

export function createDefaultButton(id: number): ButtonConfig {
  return {
    id,
    label: '',
    icon: undefined,
    color: '#1e293b',
    actions: [],
    enabled: true,
  };
}

export function createDefaultPage(name: string = 'Page 1'): Page {
  return {
    id: crypto.randomUUID?.() ?? `page-${Date.now()}`,
    name,
    buttons: Array.from({ length: 18 }, (_, i) => createDefaultButton(i + 1)),
  };
}

export function createDefaultProfile(name: string = 'Default'): Profile {
  const page = createDefaultPage();
  return {
    id: crypto.randomUUID?.() ?? `profile-${Date.now()}`,
    name,
    pages: [page],
    activePageId: page.id,
  };
}

export function createDefaultSettings(): AppSettings {
  return {
    autoStart: false,
    minimizeToTray: true,
    theme: 'dark',
    bridgeEnabled: false,
    bridgePort: 9271,
    keyboardModeEnabled: true,
    activeProfileId: '',
  };
}
