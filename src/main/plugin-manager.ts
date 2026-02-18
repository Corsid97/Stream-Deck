import type { PluginManifest, PluginStatus } from '../shared/types';

export interface PluginInstance {
  manifest: PluginManifest;
  status: PluginStatus;
  init?(): Promise<void>;
  start?(): Promise<void>;
  stop?(): Promise<void>;
  destroy?(): Promise<void>;
}

export abstract class BasePlugin implements PluginInstance {
  abstract manifest: PluginManifest;
  status: PluginStatus = 'unloaded';

  async init(): Promise<void> {
    this.status = 'loaded';
  }

  async start(): Promise<void> {
    this.status = 'active';
  }

  async stop(): Promise<void> {
    this.status = 'loaded';
  }

  async destroy(): Promise<void> {
    this.status = 'unloaded';
  }
}

// Built-in plugin definitions
class M18DriverPlugin extends BasePlugin {
  manifest: PluginManifest = {
    id: 'm18-driver',
    name: 'M18 Driver',
    version: '1.0.0',
    description: 'Manages M18 hardware device with USB VID/PIDs: 5548:1000, 6603:1009, 6603:1012',
    author: 'DeckForge',
  };

  readonly supportedDevices = [
    { vendorId: 0x5548, productId: 0x1000 },
    { vendorId: 0x6603, productId: 0x1009 },
    { vendorId: 0x6603, productId: 0x1012 },
  ];

  async init(): Promise<void> {
    await super.init();
    console.log('M18 Driver Plugin initialized');
  }

  async start(): Promise<void> {
    await super.start();
    console.log('M18 Driver Plugin started - watching for devices');
  }
}

class OpenDeckPlugin extends BasePlugin {
  manifest: PluginManifest = {
    id: 'opendeck',
    name: 'OpenDeck',
    version: '1.0.0',
    description: 'OpenDeck protocol integration for compatible hardware',
    author: 'DeckForge',
  };

  async init(): Promise<void> {
    await super.init();
    console.log('OpenDeck Plugin initialized');
  }
}

class SwitchBotPlugin extends BasePlugin {
  manifest: PluginManifest = {
    id: 'switchbot',
    name: 'SwitchBot',
    version: '1.0.0',
    description: 'Smart home control via SwitchBot local API',
    author: 'DeckForge',
  };
}

class ScreenshotPlugin extends BasePlugin {
  manifest: PluginManifest = {
    id: 'screenshot',
    name: 'Screenshot',
    version: '1.0.0',
    description: 'Enhanced screen capture with region selection',
    author: 'DeckForge',
    actions: ['screenshot-full', 'screenshot-window', 'screenshot-region'],
  };
}

export class PluginManager {
  private plugins: Map<string, PluginInstance> = new Map();

  constructor() {
    // Register built-in plugins
    this.registerPlugin(new M18DriverPlugin());
    this.registerPlugin(new OpenDeckPlugin());
    this.registerPlugin(new SwitchBotPlugin());
    this.registerPlugin(new ScreenshotPlugin());
  }

  registerPlugin(plugin: PluginInstance): void {
    this.plugins.set(plugin.manifest.id, plugin);
  }

  async loadAll(): Promise<void> {
    for (const [id, plugin] of this.plugins) {
      try {
        await plugin.init?.();
        console.log(`Plugin loaded: ${id}`);
      } catch (err) {
        plugin.status = 'error';
        console.error(`Failed to load plugin ${id}:`, err);
      }
    }
  }

  async unloadAll(): Promise<void> {
    for (const [id, plugin] of this.plugins) {
      try {
        await plugin.stop?.();
        await plugin.destroy?.();
      } catch (err) {
        console.error(`Failed to unload plugin ${id}:`, err);
      }
    }
  }

  async enablePlugin(pluginId: string): Promise<boolean> {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) return false;

    try {
      await plugin.init?.();
      await plugin.start?.();
      return true;
    } catch (err) {
      plugin.status = 'error';
      console.error(`Failed to enable plugin ${pluginId}:`, err);
      return false;
    }
  }

  async disablePlugin(pluginId: string): Promise<boolean> {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) return false;

    try {
      await plugin.stop?.();
      plugin.status = 'disabled';
      return true;
    } catch (err) {
      console.error(`Failed to disable plugin ${pluginId}:`, err);
      return false;
    }
  }

  getPlugin(pluginId: string): PluginInstance | undefined {
    return this.plugins.get(pluginId);
  }

  listPlugins(): Array<{ manifest: PluginManifest; status: PluginStatus }> {
    return Array.from(this.plugins.values()).map((p) => ({
      manifest: p.manifest,
      status: p.status,
    }));
  }
}
