import React from 'react';
import { useAppStore } from '../stores/app-store';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from './ui/dialog';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Input } from './ui/input';
import { Button } from './ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import type { PluginStatus } from '@shared/types';

function PluginStatusBadge({ status }: { status: PluginStatus }) {
  const colorMap: Record<PluginStatus, string> = {
    unloaded: 'bg-gray-500/10 text-gray-400',
    loaded: 'bg-blue-500/10 text-blue-400',
    active: 'bg-green-500/10 text-green-400',
    error: 'bg-red-500/10 text-red-400',
    disabled: 'bg-yellow-500/10 text-yellow-400',
  };

  return (
    <span className={`px-2 py-0.5 rounded text-xs ${colorMap[status]}`}>
      {status}
    </span>
  );
}

export function SettingsDialog() {
  const showSettings = useAppStore((s) => s.showSettings);
  const toggleSettings = useAppStore((s) => s.toggleSettings);
  const settings = useAppStore((s) => s.settings);
  const updateSettings = useAppStore((s) => s.updateSettings);
  const bridgeStatus = useAppStore((s) => s.bridgeStatus);
  const plugins = useAppStore((s) => s.plugins);

  const handleBridgeToggle = async (enabled: boolean) => {
    updateSettings({ bridgeEnabled: enabled });
    if (enabled) {
      await window.electronAPI.bridge.start();
    } else {
      await window.electronAPI.bridge.stop();
    }
  };

  const handlePluginToggle = async (pluginId: string, enable: boolean) => {
    if (enable) {
      await window.electronAPI.plugins.enable(pluginId);
    } else {
      await window.electronAPI.plugins.disable(pluginId);
    }
    const updatedPlugins = await window.electronAPI.plugins.list();
    useAppStore.getState().setPlugins(updatedPlugins);
  };

  return (
    <Dialog open={showSettings} onOpenChange={toggleSettings}>
      <DialogContent className="max-w-xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>Configure DeckForge preferences and plugins.</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="general" className="mt-2">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="bridge">Bridge</TabsTrigger>
            <TabsTrigger value="plugins">Plugins</TabsTrigger>
          </TabsList>

          {/* General Settings */}
          <TabsContent value="general" className="space-y-4 mt-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Auto Start</Label>
                <p className="text-xs text-muted-foreground">Launch DeckForge on system startup</p>
              </div>
              <Switch
                checked={settings.autoStart}
                onCheckedChange={(checked) => updateSettings({ autoStart: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Minimize to Tray</Label>
                <p className="text-xs text-muted-foreground">Keep running in the system tray</p>
              </div>
              <Switch
                checked={settings.minimizeToTray}
                onCheckedChange={(checked) => updateSettings({ minimizeToTray: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Keyboard Mode</Label>
                <p className="text-xs text-muted-foreground">Listen for Ctrl+Alt+Shift+1..18 shortcuts</p>
              </div>
              <Switch
                checked={settings.keyboardModeEnabled}
                onCheckedChange={(checked) => updateSettings({ keyboardModeEnabled: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Theme</Label>
                <p className="text-xs text-muted-foreground">Choose application theme</p>
              </div>
              <Select
                value={settings.theme}
                onValueChange={(v) => updateSettings({ theme: v as 'dark' | 'light' | 'system' })}
              >
                <SelectTrigger className="w-[120px] h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </TabsContent>

          {/* Bridge Settings */}
          <TabsContent value="bridge" className="space-y-4 mt-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Bridge Server</Label>
                <p className="text-xs text-muted-foreground">
                  WebSocket server for advanced OS control
                </p>
              </div>
              <Switch
                checked={settings.bridgeEnabled}
                onCheckedChange={handleBridgeToggle}
              />
            </div>

            <div>
              <Label className="text-xs">Port</Label>
              <Input
                className="h-8 text-xs mt-1 w-32"
                type="number"
                value={settings.bridgePort}
                onChange={(e) => updateSettings({ bridgePort: parseInt(e.target.value) || 9271 })}
                disabled={settings.bridgeEnabled}
              />
            </div>

            <div className="rounded-lg border border-border p-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Status</span>
                <span className={`text-xs px-2 py-0.5 rounded ${
                  bridgeStatus === 'connected'
                    ? 'bg-green-500/10 text-green-400'
                    : 'bg-muted text-muted-foreground'
                }`}>
                  {bridgeStatus}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Bridge runs on ws://127.0.0.1:{settings.bridgePort}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Enables: mouse control, media keys, window management, screenshots, and more.
              </p>
            </div>
          </TabsContent>

          {/* Plugin Settings */}
          <TabsContent value="plugins" className="space-y-3 mt-4">
            {plugins.length === 0 ? (
              <p className="text-sm text-muted-foreground">No plugins loaded.</p>
            ) : (
              plugins.map((plugin) => (
                <div
                  key={plugin.manifest.id}
                  className="flex items-center justify-between rounded-lg border border-border p-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{plugin.manifest.name}</span>
                      <PluginStatusBadge status={plugin.status} />
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {plugin.manifest.description}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      v{plugin.manifest.version} by {plugin.manifest.author}
                    </p>
                  </div>
                  <Switch
                    checked={plugin.status === 'active' || plugin.status === 'loaded'}
                    onCheckedChange={(checked) => handlePluginToggle(plugin.manifest.id, checked)}
                  />
                </div>
              ))
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
