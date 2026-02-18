import React from 'react';
import { useAppStore } from '../stores/app-store';
import type { ButtonConfig } from '@shared/types';
import { cn } from '@/lib/utils';

function DeckButton({ button, isSelected, onClick }: {
  button: ButtonConfig;
  isSelected: boolean;
  onClick: () => void;
}) {
  const hasActions = button.actions.length > 0;

  return (
    <button
      onClick={onClick}
      className={cn(
        'relative flex flex-col items-center justify-center rounded-xl border-2 transition-all duration-150',
        'aspect-square w-full cursor-pointer select-none',
        'hover:scale-105 hover:shadow-lg active:scale-95',
        isSelected
          ? 'border-blue-500 ring-2 ring-blue-500/50 shadow-blue-500/25 shadow-lg'
          : 'border-border hover:border-muted-foreground/50',
        !button.enabled && 'opacity-40'
      )}
      style={{
        backgroundColor: button.color || '#1e293b',
      }}
    >
      {button.icon && (
        <span className="text-2xl mb-1">{button.icon}</span>
      )}
      {button.label && (
        <span className="text-xs font-medium text-white/90 text-center px-1 leading-tight truncate max-w-full">
          {button.label}
        </span>
      )}
      {!button.label && !button.icon && (
        <span className="text-xs text-white/30">{button.id}</span>
      )}
      {hasActions && (
        <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-green-400" />
      )}
    </button>
  );
}

export function DeckGrid() {
  const profiles = useAppStore((s) => s.profiles);
  const activeProfileId = useAppStore((s) => s.activeProfileId);
  const activePageId = useAppStore((s) => s.activePageId);
  const selectedButtonId = useAppStore((s) => s.selectedButtonId);
  const selectButton = useAppStore((s) => s.selectButton);

  const activeProfile = profiles.find((p) => p.id === activeProfileId);
  const activePage = activeProfile?.pages.find((pg) => pg.id === activePageId);
  const buttons = activePage?.buttons || [];

  return (
    <div className="flex-1 flex items-center justify-center p-6">
      <div className="grid grid-cols-6 grid-rows-3 gap-3 w-full max-w-3xl">
        {buttons.map((button) => (
          <DeckButton
            key={button.id}
            button={button}
            isSelected={selectedButtonId === button.id}
            onClick={() => selectButton(selectedButtonId === button.id ? null : button.id)}
          />
        ))}
      </div>
    </div>
  );
}
