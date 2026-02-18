import React, { useState } from 'react';
import { useAppStore } from '../stores/app-store';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from './ui/dialog';
import { Button } from './ui/button';
import { Usb, CheckCircle, AlertCircle, Keyboard } from 'lucide-react';

type WizardStep = 'welcome' | 'connect' | 'mode' | 'done';

export function M18SetupWizard() {
  const showSetupWizard = useAppStore((s) => s.showSetupWizard);
  const toggleSetupWizard = useAppStore((s) => s.toggleSetupWizard);
  const settings = useAppStore((s) => s.settings);
  const updateSettings = useAppStore((s) => s.updateSettings);

  const [step, setStep] = useState<WizardStep>('welcome');

  const handleClose = () => {
    setStep('welcome');
    toggleSetupWizard();
  };

  return (
    <Dialog open={showSetupWizard} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        {step === 'welcome' && (
          <>
            <DialogHeader>
              <DialogTitle>M18 Hardware Setup</DialogTitle>
              <DialogDescription>
                Configure your M18 macro pad to work with DeckForge.
              </DialogDescription>
            </DialogHeader>
            <div className="py-6 text-center">
              <Usb className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <p className="text-sm text-muted-foreground">
                DeckForge supports the M18 macro pad with the following USB IDs:
              </p>
              <div className="mt-3 space-y-1">
                <code className="text-xs bg-muted px-2 py-1 rounded block">VID: 5548 / PID: 1000</code>
                <code className="text-xs bg-muted px-2 py-1 rounded block">VID: 6603 / PID: 1009</code>
                <code className="text-xs bg-muted px-2 py-1 rounded block">VID: 6603 / PID: 1012</code>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={handleClose}>Cancel</Button>
              <Button onClick={() => setStep('connect')}>Next</Button>
            </DialogFooter>
          </>
        )}

        {step === 'connect' && (
          <>
            <DialogHeader>
              <DialogTitle>Connect Your Device</DialogTitle>
              <DialogDescription>
                Plug in your M18 macro pad via USB.
              </DialogDescription>
            </DialogHeader>
            <div className="py-6 text-center">
              <div className="flex items-center justify-center gap-2 mb-4">
                <AlertCircle className="h-5 w-5 text-yellow-400" />
                <span className="text-sm">Searching for device...</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Make sure your M18 device is connected. The device sends Ctrl+Alt+Shift+1..18
                key combinations which DeckForge intercepts as macro triggers.
              </p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setStep('welcome')}>Back</Button>
              <Button onClick={() => setStep('mode')}>Continue Anyway</Button>
            </DialogFooter>
          </>
        )}

        {step === 'mode' && (
          <>
            <DialogHeader>
              <DialogTitle>Choose Your Mode</DialogTitle>
              <DialogDescription>
                DeckForge supports two operation modes.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-3">
              <button
                onClick={() => {
                  updateSettings({ keyboardModeEnabled: true, bridgeEnabled: false });
                  setStep('done');
                }}
                className={`w-full text-left p-4 rounded-lg border transition-colors ${
                  settings.keyboardModeEnabled && !settings.bridgeEnabled
                    ? 'border-blue-500 bg-blue-500/10'
                    : 'border-border hover:border-muted-foreground/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Keyboard className="h-5 w-5" />
                  <div>
                    <p className="text-sm font-medium">Keyboard Mode</p>
                    <p className="text-xs text-muted-foreground">
                      Uses global shortcuts (Ctrl+Alt+Shift+1..18). No bridge required.
                      Supports: Open URL, Insert Text, Launch Apps, Run Scripts.
                    </p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => {
                  updateSettings({ keyboardModeEnabled: true, bridgeEnabled: true });
                  setStep('done');
                }}
                className={`w-full text-left p-4 rounded-lg border transition-colors ${
                  settings.bridgeEnabled
                    ? 'border-blue-500 bg-blue-500/10'
                    : 'border-border hover:border-muted-foreground/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Usb className="h-5 w-5" />
                  <div>
                    <p className="text-sm font-medium">Bridge Mode (Advanced)</p>
                    <p className="text-xs text-muted-foreground">
                      Enables full OS-level automation via WebSocket bridge.
                      Adds: Mouse control, Media keys, Window management, Screenshots.
                    </p>
                  </div>
                </div>
              </button>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setStep('connect')}>Back</Button>
            </DialogFooter>
          </>
        )}

        {step === 'done' && (
          <>
            <DialogHeader>
              <DialogTitle>Setup Complete</DialogTitle>
              <DialogDescription>
                DeckForge is ready to use.
              </DialogDescription>
            </DialogHeader>
            <div className="py-6 text-center">
              <CheckCircle className="h-16 w-16 mx-auto text-green-400 mb-4" />
              <p className="text-sm">
                {settings.bridgeEnabled
                  ? 'Bridge Mode enabled. WebSocket server running on port ' + settings.bridgePort + '.'
                  : 'Keyboard Mode enabled. Listening for Ctrl+Alt+Shift+1..18 shortcuts.'}
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Click any button on the grid to configure its actions.
              </p>
            </div>
            <DialogFooter>
              <Button onClick={handleClose}>Done</Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
