import React, { useEffect } from 'react';
import { useAppStore } from './stores/app-store';
import { useShortcutListener } from './hooks/use-shortcut-listener';
import { DeckHeader } from './components/DeckHeader';
import { DeckGrid } from './components/DeckGrid';
import { ButtonEditor } from './components/ButtonEditor';
import { SettingsDialog } from './components/SettingsDialog';
import { M18SetupWizard } from './components/M18SetupWizard';
import { TooltipProvider } from './components/ui/tooltip';

export function App() {
  const loadFromStore = useAppStore((s) => s.loadFromStore);

  useEffect(() => {
    loadFromStore();
  }, [loadFromStore]);

  useShortcutListener();

  return (
    <TooltipProvider>
      <div className="h-screen flex flex-col bg-background">
        <DeckHeader />
        <div className="flex-1 flex overflow-hidden">
          <DeckGrid />
          <ButtonEditor />
        </div>
        <SettingsDialog />
        <M18SetupWizard />
      </div>
    </TooltipProvider>
  );
}
