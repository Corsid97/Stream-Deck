import { useEffect } from 'react';
import { useAppStore } from '../stores/app-store';

export function useShortcutListener() {
  const selectButton = useAppStore((s) => s.selectButton);

  useEffect(() => {
    if (!window.electronAPI) return;

    const cleanup = window.electronAPI.shortcuts.onTriggered((buttonIndex: number) => {
      console.log(`Button ${buttonIndex} triggered via shortcut`);
      // Flash the button in the UI
      selectButton(buttonIndex);
      setTimeout(() => selectButton(null), 200);
    });

    return () => { cleanup(); };
  }, [selectButton]);
}
