import { shell, clipboard } from 'electron';
import { exec } from 'child_process';
import type { ActionConfig, ButtonConfig, Profile } from '../shared/types';
import type { DataStore } from './store';

export class ActionExecutor {
  private store: DataStore;

  constructor(store: DataStore) {
    this.store = store;
  }

  async executeButtonActions(buttonIndex: number): Promise<void> {
    const profiles = this.store.getProfiles();
    const settings = this.store.getSettings();
    const activeProfile = profiles.find((p: Profile) => p.id === settings.activeProfileId);

    if (!activeProfile) return;

    const activePage = activeProfile.pages.find((p) => p.id === activeProfile.activePageId);
    if (!activePage) return;

    const button = activePage.buttons.find((b: ButtonConfig) => b.id === buttonIndex);
    if (!button || !button.enabled || button.actions.length === 0) return;

    for (const action of button.actions) {
      try {
        await this.execute(action);
      } catch (err) {
        console.error(`Failed to execute action ${action.type}:`, err);
      }
    }
  }

  async execute(action: ActionConfig): Promise<{ success: boolean; error?: string }> {
    try {
      switch (action.type) {
        case 'open-url':
          await shell.openExternal(action.params.url as string);
          break;

        case 'open-app':
          await shell.openPath(action.params.path as string);
          break;

        case 'close-app':
          await this.closeApp(action.params);
          break;

        case 'insert-text':
        case 'paste-clipboard':
          clipboard.writeText(action.params.text as string);
          break;

        case 'run-script':
          await this.runScript(action.params);
          break;

        case 'media-play-pause':
        case 'media-next':
        case 'media-previous':
        case 'media-volume-up':
        case 'media-volume-down':
        case 'media-mute':
          await this.handleMediaAction(action.type);
          break;

        case 'screenshot-full':
        case 'screenshot-window':
        case 'screenshot-region':
          await this.handleScreenshot(action.type);
          break;

        case 'mouse-click':
          await this.handleMouseAction('click', action.params);
          break;

        case 'mouse-move':
          await this.handleMouseAction('move', action.params);
          break;

        case 'mouse-scroll':
          await this.handleMouseAction('scroll', action.params);
          break;

        case 'window-minimize':
        case 'window-maximize':
        case 'window-focus':
        case 'window-resize':
          await this.handleWindowAction(action.type, action.params);
          break;

        case 'display-brightness':
          await this.handleBrightness(action.params);
          break;

        case 'hotkey':
          await this.sendHotkey(action.params);
          break;

        default:
          return { success: false, error: `Unknown action type: ${action.type}` };
      }

      return { success: true };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return { success: false, error: message };
    }
  }

  private closeApp(params: Record<string, unknown>): Promise<void> {
    return new Promise((resolve, reject) => {
      const name = params.name as string;
      const pid = params.pid as number;

      let cmd: string;
      if (pid) {
        cmd = process.platform === 'win32' ? `taskkill /PID ${pid} /F` : `kill ${pid}`;
      } else if (name) {
        cmd = process.platform === 'win32'
          ? `taskkill /IM "${name}" /F`
          : `pkill -f "${name}"`;
      } else {
        return reject(new Error('No app name or PID provided'));
      }

      exec(cmd, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  private runScript(params: Record<string, unknown>): Promise<string> {
    return new Promise((resolve, reject) => {
      const script = params.script as string;
      const shell = params.shell as string || (process.platform === 'win32' ? 'cmd.exe' : '/bin/bash');

      exec(script, { shell, timeout: 30000 }, (err, stdout, stderr) => {
        if (err) reject(err);
        else resolve(stdout || stderr);
      });
    });
  }

  private handleMediaAction(type: string): Promise<void> {
    return new Promise((resolve, reject) => {
      // Use platform-specific media key simulation
      let cmd: string;
      const mediaKeyMap: Record<string, string> = {
        'media-play-pause': 'XF86AudioPlay',
        'media-next': 'XF86AudioNext',
        'media-previous': 'XF86AudioPrev',
        'media-volume-up': 'XF86AudioRaiseVolume',
        'media-volume-down': 'XF86AudioLowerVolume',
        'media-mute': 'XF86AudioMute',
      };

      if (process.platform === 'linux') {
        const key = mediaKeyMap[type];
        cmd = `xdotool key ${key}`;
      } else if (process.platform === 'darwin') {
        const osascriptMap: Record<string, string> = {
          'media-play-pause': 'tell application "System Events" to key code 16 using {command down}',
          'media-next': 'tell application "System Events" to key code 17 using {command down}',
          'media-previous': 'tell application "System Events" to key code 18 using {command down}',
          'media-volume-up': 'set volume output volume ((output volume of (get volume settings)) + 10)',
          'media-volume-down': 'set volume output volume ((output volume of (get volume settings)) - 10)',
          'media-mute': 'set volume with output muted',
        };
        cmd = `osascript -e '${osascriptMap[type]}'`;
      } else {
        // Windows - use PowerShell or nircmd
        const winMap: Record<string, string> = {
          'media-play-pause': '$wshell = New-Object -ComObject wscript.shell; $wshell.SendKeys([char]0xB3)',
          'media-next': '$wshell = New-Object -ComObject wscript.shell; $wshell.SendKeys([char]0xB0)',
          'media-previous': '$wshell = New-Object -ComObject wscript.shell; $wshell.SendKeys([char]0xB1)',
          'media-volume-up': '$wshell = New-Object -ComObject wscript.shell; $wshell.SendKeys([char]0xAF)',
          'media-volume-down': '$wshell = New-Object -ComObject wscript.shell; $wshell.SendKeys([char]0xAE)',
          'media-mute': '$wshell = New-Object -ComObject wscript.shell; $wshell.SendKeys([char]0xAD)',
        };
        cmd = `powershell -Command "${winMap[type]}"`;
      }

      exec(cmd, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  private handleScreenshot(type: string): Promise<void> {
    return new Promise((resolve, reject) => {
      let cmd: string;

      if (process.platform === 'linux') {
        switch (type) {
          case 'screenshot-full':
            cmd = 'gnome-screenshot';
            break;
          case 'screenshot-window':
            cmd = 'gnome-screenshot -w';
            break;
          case 'screenshot-region':
            cmd = 'gnome-screenshot -a';
            break;
          default:
            cmd = 'gnome-screenshot';
        }
      } else if (process.platform === 'darwin') {
        switch (type) {
          case 'screenshot-full':
            cmd = 'screencapture ~/Desktop/screenshot.png';
            break;
          case 'screenshot-window':
            cmd = 'screencapture -w ~/Desktop/screenshot.png';
            break;
          case 'screenshot-region':
            cmd = 'screencapture -s ~/Desktop/screenshot.png';
            break;
          default:
            cmd = 'screencapture ~/Desktop/screenshot.png';
        }
      } else {
        // Windows
        cmd = 'snippingtool /clip';
      }

      exec(cmd, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  private handleMouseAction(action: string, params: Record<string, unknown>): Promise<void> {
    return new Promise((resolve, reject) => {
      const x = params.x as number || 0;
      const y = params.y as number || 0;
      let cmd: string;

      if (process.platform === 'linux') {
        switch (action) {
          case 'click':
            cmd = `xdotool mousemove ${x} ${y} click ${params.button || 1}`;
            break;
          case 'move':
            cmd = `xdotool mousemove ${x} ${y}`;
            break;
          case 'scroll':
            cmd = `xdotool mousemove ${x} ${y} click ${(params.direction === 'up') ? 4 : 5}`;
            break;
          default:
            cmd = '';
        }
      } else if (process.platform === 'darwin') {
        cmd = `osascript -e 'tell application "System Events" to click at {${x}, ${y}}'`;
      } else {
        cmd = `powershell -Command "[System.Windows.Forms.Cursor]::Position = New-Object System.Drawing.Point(${x},${y})"`;
      }

      if (!cmd) return resolve();
      exec(cmd, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  private handleWindowAction(type: string, params: Record<string, unknown>): Promise<void> {
    return new Promise((resolve, reject) => {
      let cmd = '';
      if (process.platform === 'linux') {
        switch (type) {
          case 'window-minimize':
            cmd = 'xdotool getactivewindow windowminimize';
            break;
          case 'window-maximize':
            cmd = 'wmctrl -r :ACTIVE: -b toggle,maximized_vert,maximized_horz';
            break;
          case 'window-focus':
            cmd = params.name ? `wmctrl -a "${params.name}"` : '';
            break;
          case 'window-resize':
            cmd = `xdotool getactivewindow windowsize ${params.width || 800} ${params.height || 600}`;
            break;
        }
      }

      if (!cmd) return resolve();
      exec(cmd, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  private handleBrightness(params: Record<string, unknown>): Promise<void> {
    return new Promise((resolve, reject) => {
      const level = params.level as number || 50;
      let cmd = '';

      if (process.platform === 'linux') {
        cmd = `xrandr --output $(xrandr | grep ' connected' | head -1 | cut -d' ' -f1) --brightness ${level / 100}`;
      }

      if (!cmd) return resolve();
      exec(cmd, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  private sendHotkey(params: Record<string, unknown>): Promise<void> {
    return new Promise((resolve, reject) => {
      const keys = params.keys as string;
      if (!keys) return resolve();

      let cmd = '';
      if (process.platform === 'linux') {
        cmd = `xdotool key ${keys}`;
      }

      if (!cmd) return resolve();
      exec(cmd, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }
}
