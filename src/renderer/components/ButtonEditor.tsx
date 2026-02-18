import React, { useState } from 'react';
import { useAppStore } from '../stores/app-store';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Switch } from './ui/switch';
import { X, Plus, Trash2, GripVertical } from 'lucide-react';
import type { ActionType, ActionConfig } from '@shared/types';

const ACTION_CATEGORIES = {
  'Applications': [
    { type: 'open-app' as ActionType, label: 'Open Application' },
    { type: 'close-app' as ActionType, label: 'Close Application' },
  ],
  'Web': [
    { type: 'open-url' as ActionType, label: 'Open URL' },
  ],
  'Text': [
    { type: 'insert-text' as ActionType, label: 'Insert Text' },
    { type: 'paste-clipboard' as ActionType, label: 'Paste Clipboard' },
  ],
  'Media': [
    { type: 'media-play-pause' as ActionType, label: 'Play / Pause' },
    { type: 'media-next' as ActionType, label: 'Next Track' },
    { type: 'media-previous' as ActionType, label: 'Previous Track' },
    { type: 'media-volume-up' as ActionType, label: 'Volume Up' },
    { type: 'media-volume-down' as ActionType, label: 'Volume Down' },
    { type: 'media-mute' as ActionType, label: 'Mute' },
  ],
  'Screenshot': [
    { type: 'screenshot-full' as ActionType, label: 'Full Screen' },
    { type: 'screenshot-window' as ActionType, label: 'Active Window' },
    { type: 'screenshot-region' as ActionType, label: 'Region Select' },
  ],
  'Mouse': [
    { type: 'mouse-click' as ActionType, label: 'Click' },
    { type: 'mouse-move' as ActionType, label: 'Move' },
    { type: 'mouse-scroll' as ActionType, label: 'Scroll' },
  ],
  'Window': [
    { type: 'window-minimize' as ActionType, label: 'Minimize' },
    { type: 'window-maximize' as ActionType, label: 'Maximize' },
    { type: 'window-focus' as ActionType, label: 'Focus' },
    { type: 'window-resize' as ActionType, label: 'Resize' },
  ],
  'Display': [
    { type: 'display-brightness' as ActionType, label: 'Brightness' },
  ],
  'System': [
    { type: 'run-script' as ActionType, label: 'Run Script' },
    { type: 'hotkey' as ActionType, label: 'Hotkey' },
  ],
};

function ActionParamsEditor({ action, onChange }: {
  action: ActionConfig;
  onChange: (params: Record<string, unknown>) => void;
}) {
  switch (action.type) {
    case 'open-url':
      return (
        <div className="mt-2">
          <Label className="text-xs">URL</Label>
          <Input
            className="h-8 text-xs mt-1"
            placeholder="https://example.com"
            value={(action.params.url as string) || ''}
            onChange={(e) => onChange({ ...action.params, url: e.target.value })}
          />
        </div>
      );
    case 'open-app':
      return (
        <div className="mt-2">
          <Label className="text-xs">Application Path</Label>
          <Input
            className="h-8 text-xs mt-1"
            placeholder="/usr/bin/app"
            value={(action.params.path as string) || ''}
            onChange={(e) => onChange({ ...action.params, path: e.target.value })}
          />
        </div>
      );
    case 'close-app':
      return (
        <div className="mt-2">
          <Label className="text-xs">App Name</Label>
          <Input
            className="h-8 text-xs mt-1"
            placeholder="firefox"
            value={(action.params.name as string) || ''}
            onChange={(e) => onChange({ ...action.params, name: e.target.value })}
          />
        </div>
      );
    case 'insert-text':
    case 'paste-clipboard':
      return (
        <div className="mt-2">
          <Label className="text-xs">Text</Label>
          <Input
            className="h-8 text-xs mt-1"
            placeholder="Text to insert..."
            value={(action.params.text as string) || ''}
            onChange={(e) => onChange({ ...action.params, text: e.target.value })}
          />
        </div>
      );
    case 'run-script':
      return (
        <div className="mt-2">
          <Label className="text-xs">Script Command</Label>
          <Input
            className="h-8 text-xs mt-1"
            placeholder="echo Hello"
            value={(action.params.script as string) || ''}
            onChange={(e) => onChange({ ...action.params, script: e.target.value })}
          />
        </div>
      );
    case 'hotkey':
      return (
        <div className="mt-2">
          <Label className="text-xs">Key Combination</Label>
          <Input
            className="h-8 text-xs mt-1"
            placeholder="ctrl+shift+t"
            value={(action.params.keys as string) || ''}
            onChange={(e) => onChange({ ...action.params, keys: e.target.value })}
          />
        </div>
      );
    case 'mouse-click':
    case 'mouse-move':
      return (
        <div className="mt-2 grid grid-cols-2 gap-2">
          <div>
            <Label className="text-xs">X</Label>
            <Input
              className="h-8 text-xs mt-1"
              type="number"
              value={(action.params.x as number) || 0}
              onChange={(e) => onChange({ ...action.params, x: parseInt(e.target.value) })}
            />
          </div>
          <div>
            <Label className="text-xs">Y</Label>
            <Input
              className="h-8 text-xs mt-1"
              type="number"
              value={(action.params.y as number) || 0}
              onChange={(e) => onChange({ ...action.params, y: parseInt(e.target.value) })}
            />
          </div>
        </div>
      );
    case 'window-focus':
      return (
        <div className="mt-2">
          <Label className="text-xs">Window Name</Label>
          <Input
            className="h-8 text-xs mt-1"
            placeholder="Window title"
            value={(action.params.name as string) || ''}
            onChange={(e) => onChange({ ...action.params, name: e.target.value })}
          />
        </div>
      );
    case 'window-resize':
      return (
        <div className="mt-2 grid grid-cols-2 gap-2">
          <div>
            <Label className="text-xs">Width</Label>
            <Input
              className="h-8 text-xs mt-1"
              type="number"
              value={(action.params.width as number) || 800}
              onChange={(e) => onChange({ ...action.params, width: parseInt(e.target.value) })}
            />
          </div>
          <div>
            <Label className="text-xs">Height</Label>
            <Input
              className="h-8 text-xs mt-1"
              type="number"
              value={(action.params.height as number) || 600}
              onChange={(e) => onChange({ ...action.params, height: parseInt(e.target.value) })}
            />
          </div>
        </div>
      );
    case 'display-brightness':
      return (
        <div className="mt-2">
          <Label className="text-xs">Brightness Level (0-100)</Label>
          <Input
            className="h-8 text-xs mt-1"
            type="number"
            min={0}
            max={100}
            value={(action.params.level as number) || 50}
            onChange={(e) => onChange({ ...action.params, level: parseInt(e.target.value) })}
          />
        </div>
      );
    default:
      return null;
  }
}

export function ButtonEditor() {
  const selectedButtonId = useAppStore((s) => s.selectedButtonId);
  const editingButton = useAppStore((s) => s.editingButton);
  const updateButton = useAppStore((s) => s.updateButton);
  const addActionToButton = useAppStore((s) => s.addActionToButton);
  const removeActionFromButton = useAppStore((s) => s.removeActionFromButton);
  const selectButton = useAppStore((s) => s.selectButton);

  const [newActionType, setNewActionType] = useState<ActionType | ''>('');

  if (!selectedButtonId || !editingButton) {
    return (
      <div className="w-80 border-l border-border bg-card/50 flex items-center justify-center p-6">
        <p className="text-sm text-muted-foreground text-center">
          Select a button to edit its configuration
        </p>
      </div>
    );
  }

  const allActions = Object.values(ACTION_CATEGORIES).flat();

  const handleAddAction = () => {
    if (!newActionType) return;
    const actionDef = allActions.find((a) => a.type === newActionType);
    if (!actionDef) return;

    addActionToButton(selectedButtonId, {
      type: newActionType,
      label: actionDef.label,
      params: {},
    });
    setNewActionType('');
  };

  return (
    <div className="w-80 border-l border-border bg-card/50 flex flex-col overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h2 className="text-sm font-semibold">Button {selectedButtonId}</h2>
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => selectButton(null)}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Label */}
        <div>
          <Label className="text-xs">Label</Label>
          <Input
            className="h-8 text-xs mt-1"
            placeholder="Button label"
            value={editingButton.label}
            onChange={(e) => updateButton(selectedButtonId, { label: e.target.value })}
          />
        </div>

        {/* Icon */}
        <div>
          <Label className="text-xs">Icon (emoji)</Label>
          <Input
            className="h-8 text-xs mt-1"
            placeholder="Paste an emoji..."
            value={editingButton.icon || ''}
            onChange={(e) => updateButton(selectedButtonId, { icon: e.target.value })}
          />
        </div>

        {/* Color */}
        <div>
          <Label className="text-xs">Color</Label>
          <div className="flex gap-2 mt-1">
            <input
              type="color"
              value={editingButton.color}
              onChange={(e) => updateButton(selectedButtonId, { color: e.target.value })}
              className="h-8 w-12 rounded cursor-pointer border border-input"
            />
            <Input
              className="h-8 text-xs flex-1"
              value={editingButton.color}
              onChange={(e) => updateButton(selectedButtonId, { color: e.target.value })}
            />
          </div>
        </div>

        {/* Enabled toggle */}
        <div className="flex items-center justify-between">
          <Label className="text-xs">Enabled</Label>
          <Switch
            checked={editingButton.enabled}
            onCheckedChange={(checked) => updateButton(selectedButtonId, { enabled: checked })}
          />
        </div>

        {/* Actions */}
        <div>
          <Label className="text-xs mb-2 block">Actions ({editingButton.actions.length})</Label>

          <div className="space-y-2">
            {editingButton.actions.map((action, index) => (
              <div key={index} className="rounded-lg border border-border bg-background p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <GripVertical className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs font-medium">{action.label}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-destructive"
                    onClick={() => removeActionFromButton(selectedButtonId, index)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
                <ActionParamsEditor
                  action={action}
                  onChange={(params) => {
                    const updatedActions = [...editingButton.actions];
                    updatedActions[index] = { ...action, params };
                    updateButton(selectedButtonId, { actions: updatedActions });
                  }}
                />
              </div>
            ))}
          </div>

          {/* Add action */}
          <div className="flex gap-2 mt-3">
            <Select value={newActionType} onValueChange={(v) => setNewActionType(v as ActionType)}>
              <SelectTrigger className="h-8 text-xs flex-1">
                <SelectValue placeholder="Add action..." />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(ACTION_CATEGORIES).map(([category, actions]) => (
                  <React.Fragment key={category}>
                    <div className="px-2 py-1 text-xs font-semibold text-muted-foreground">
                      {category}
                    </div>
                    {actions.map((a) => (
                      <SelectItem key={a.type} value={a.type} className="text-xs">
                        {a.label}
                      </SelectItem>
                    ))}
                  </React.Fragment>
                ))}
              </SelectContent>
            </Select>
            <Button size="sm" className="h-8" onClick={handleAddAction} disabled={!newActionType}>
              <Plus className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
