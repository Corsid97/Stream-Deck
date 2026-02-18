import React, { useState } from 'react';
import { useAppStore } from '../stores/app-store';
import { Button } from './ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import {
  Settings,
  Plus,
  Trash2,
  Layers,
  Wifi,
  WifiOff,
  Keyboard,
  Usb,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function DeckHeader() {
  const profiles = useAppStore((s) => s.profiles);
  const activeProfileId = useAppStore((s) => s.activeProfileId);
  const activePageId = useAppStore((s) => s.activePageId);
  const bridgeStatus = useAppStore((s) => s.bridgeStatus);
  const settings = useAppStore((s) => s.settings);
  const setActiveProfile = useAppStore((s) => s.setActiveProfile);
  const setActivePage = useAppStore((s) => s.setActivePage);
  const addProfile = useAppStore((s) => s.addProfile);
  const addPage = useAppStore((s) => s.addPage);
  const deletePage = useAppStore((s) => s.deletePage);
  const toggleSettings = useAppStore((s) => s.toggleSettings);
  const toggleSetupWizard = useAppStore((s) => s.toggleSetupWizard);

  const activeProfile = profiles.find((p) => p.id === activeProfileId);
  const pages = activeProfile?.pages || [];

  return (
    <header className="flex items-center justify-between border-b border-border px-4 py-3 bg-card">
      <div className="flex items-center gap-3">
        <h1 className="text-lg font-bold tracking-tight">DeckForge</h1>

        {/* Profile selector */}
        <Select value={activeProfileId} onValueChange={setActiveProfile}>
          <SelectTrigger className="w-[160px] h-8">
            <SelectValue placeholder="Profile" />
          </SelectTrigger>
          <SelectContent>
            {profiles.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => addProfile(`Profile ${profiles.length + 1}`)}
          title="Add Profile"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* Page tabs */}
      <div className="flex items-center gap-1">
        <Layers className="h-4 w-4 text-muted-foreground mr-1" />
        {pages.map((page) => (
          <Button
            key={page.id}
            variant={page.id === activePageId ? 'secondary' : 'ghost'}
            size="sm"
            className="h-7 text-xs"
            onClick={() => setActivePage(page.id)}
          >
            {page.name}
          </Button>
        ))}
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => addPage(`Page ${pages.length + 1}`)}
          title="Add Page"
        >
          <Plus className="h-3 w-3" />
        </Button>
        {pages.length > 1 && (
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-destructive"
            onClick={() => deletePage(activePageId)}
            title="Delete Page"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        )}
      </div>

      {/* Status & Actions */}
      <div className="flex items-center gap-2">
        {/* Keyboard mode indicator */}
        <div
          className={cn(
            'flex items-center gap-1 px-2 py-1 rounded text-xs',
            settings.keyboardModeEnabled
              ? 'bg-green-500/10 text-green-400'
              : 'bg-muted text-muted-foreground'
          )}
          title={`Keyboard Mode: ${settings.keyboardModeEnabled ? 'Active' : 'Inactive'}`}
        >
          <Keyboard className="h-3 w-3" />
          <span>KB</span>
        </div>

        {/* Bridge status indicator */}
        <div
          className={cn(
            'flex items-center gap-1 px-2 py-1 rounded text-xs cursor-pointer',
            bridgeStatus === 'connected'
              ? 'bg-green-500/10 text-green-400'
              : bridgeStatus === 'error'
              ? 'bg-red-500/10 text-red-400'
              : 'bg-muted text-muted-foreground'
          )}
          title={`Bridge: ${bridgeStatus}`}
        >
          {bridgeStatus === 'connected' ? (
            <Wifi className="h-3 w-3" />
          ) : (
            <WifiOff className="h-3 w-3" />
          )}
          <span>{bridgeStatus === 'connected' ? 'Bridge' : 'No Bridge'}</span>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={toggleSetupWizard}
          title="Hardware Setup"
        >
          <Usb className="h-4 w-4" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={toggleSettings}
          title="Settings"
        >
          <Settings className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}
