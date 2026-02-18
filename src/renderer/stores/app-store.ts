import { create } from 'zustand';
import type {
  Profile,
  Page,
  ButtonConfig,
  AppSettings,
  ActionConfig,
  BridgeStatus,
  PluginManifest,
  PluginStatus,
} from '@shared/types';
import {
  createDefaultProfile,
  createDefaultPage,
  createDefaultButton,
  createDefaultSettings,
} from '@shared/types';

interface AppState {
  // Profiles
  profiles: Profile[];
  activeProfileId: string;
  activePageId: string;

  // Settings
  settings: AppSettings;

  // Bridge
  bridgeStatus: BridgeStatus;

  // Plugins
  plugins: Array<{ manifest: PluginManifest; status: PluginStatus }>;

  // UI State
  selectedButtonId: number | null;
  editingButton: ButtonConfig | null;
  showSettings: boolean;
  showSetupWizard: boolean;

  // Actions
  loadFromStore: () => Promise<void>;
  saveToStore: () => Promise<void>;

  // Profile management
  setActiveProfile: (profileId: string) => void;
  addProfile: (name: string) => void;
  deleteProfile: (profileId: string) => void;
  renameProfile: (profileId: string, name: string) => void;

  // Page management
  setActivePage: (pageId: string) => void;
  addPage: (name: string) => void;
  deletePage: (pageId: string) => void;
  renamePage: (pageId: string, name: string) => void;

  // Button management
  selectButton: (buttonId: number | null) => void;
  updateButton: (buttonId: number, updates: Partial<ButtonConfig>) => void;
  addActionToButton: (buttonId: number, action: ActionConfig) => void;
  removeActionFromButton: (buttonId: number, actionIndex: number) => void;

  // Settings
  updateSettings: (updates: Partial<AppSettings>) => void;
  toggleSettings: () => void;
  toggleSetupWizard: () => void;

  // Bridge
  setBridgeStatus: (status: BridgeStatus) => void;

  // Plugins
  setPlugins: (plugins: Array<{ manifest: PluginManifest; status: PluginStatus }>) => void;
}

const api = window.electronAPI;

export const useAppStore = create<AppState>((set, get) => ({
  profiles: [],
  activeProfileId: '',
  activePageId: '',
  settings: createDefaultSettings(),
  bridgeStatus: 'disconnected',
  plugins: [],
  selectedButtonId: null,
  editingButton: null,
  showSettings: false,
  showSetupWizard: false,

  loadFromStore: async () => {
    try {
      const profiles = (await api.store.get('profiles')) as Profile[] | undefined;
      const settings = (await api.store.get('settings')) as AppSettings | undefined;

      if (profiles && profiles.length > 0 && settings) {
        const activeProfile = profiles.find((p) => p.id === settings.activeProfileId) || profiles[0];
        set({
          profiles,
          settings,
          activeProfileId: activeProfile.id,
          activePageId: activeProfile.activePageId,
        });
      } else {
        // Initialize with defaults
        const defaultProfile = createDefaultProfile();
        const defaultSettings = createDefaultSettings();
        defaultSettings.activeProfileId = defaultProfile.id;

        set({
          profiles: [defaultProfile],
          settings: defaultSettings,
          activeProfileId: defaultProfile.id,
          activePageId: defaultProfile.activePageId,
        });

        await api.store.set('profiles', [defaultProfile]);
        await api.store.set('settings', defaultSettings);
      }

      // Load plugins
      const plugins = await api.plugins.list();
      set({ plugins });

      // Check bridge status
      const bridgeStatus = await api.bridge.getStatus();
      set({ bridgeStatus: bridgeStatus as BridgeStatus });
    } catch (err) {
      console.error('Failed to load from store:', err);
    }
  },

  saveToStore: async () => {
    const { profiles, settings } = get();
    await api.store.set('profiles', profiles);
    await api.store.set('settings', settings);
  },

  // Profile management
  setActiveProfile: (profileId) => {
    const { profiles } = get();
    const profile = profiles.find((p) => p.id === profileId);
    if (profile) {
      set({
        activeProfileId: profileId,
        activePageId: profile.activePageId,
        selectedButtonId: null,
        editingButton: null,
      });
      get().updateSettings({ activeProfileId: profileId });
    }
  },

  addProfile: (name) => {
    const newProfile = createDefaultProfile(name);
    set((state) => ({
      profiles: [...state.profiles, newProfile],
    }));
    get().saveToStore();
  },

  deleteProfile: (profileId) => {
    const { profiles, activeProfileId } = get();
    if (profiles.length <= 1) return;

    const remaining = profiles.filter((p) => p.id !== profileId);
    set({ profiles: remaining });

    if (activeProfileId === profileId) {
      get().setActiveProfile(remaining[0].id);
    }
    get().saveToStore();
  },

  renameProfile: (profileId, name) => {
    set((state) => ({
      profiles: state.profiles.map((p) => (p.id === profileId ? { ...p, name } : p)),
    }));
    get().saveToStore();
  },

  // Page management
  setActivePage: (pageId) => {
    set((state) => {
      const profiles = state.profiles.map((p) => {
        if (p.id === state.activeProfileId) {
          return { ...p, activePageId: pageId };
        }
        return p;
      });
      return { profiles, activePageId: pageId, selectedButtonId: null, editingButton: null };
    });
    get().saveToStore();
  },

  addPage: (name) => {
    const newPage = createDefaultPage(name);
    set((state) => ({
      profiles: state.profiles.map((p) => {
        if (p.id === state.activeProfileId) {
          return { ...p, pages: [...p.pages, newPage] };
        }
        return p;
      }),
    }));
    get().saveToStore();
  },

  deletePage: (pageId) => {
    set((state) => {
      const profile = state.profiles.find((p) => p.id === state.activeProfileId);
      if (!profile || profile.pages.length <= 1) return state;

      const updatedProfiles = state.profiles.map((p) => {
        if (p.id === state.activeProfileId) {
          const pages = p.pages.filter((pg) => pg.id !== pageId);
          const activePageId = p.activePageId === pageId ? pages[0].id : p.activePageId;
          return { ...p, pages, activePageId };
        }
        return p;
      });

      const updatedProfile = updatedProfiles.find((p) => p.id === state.activeProfileId);
      return {
        profiles: updatedProfiles,
        activePageId: updatedProfile?.activePageId || state.activePageId,
      };
    });
    get().saveToStore();
  },

  renamePage: (pageId, name) => {
    set((state) => ({
      profiles: state.profiles.map((p) => {
        if (p.id === state.activeProfileId) {
          return {
            ...p,
            pages: p.pages.map((pg) => (pg.id === pageId ? { ...pg, name } : pg)),
          };
        }
        return p;
      }),
    }));
    get().saveToStore();
  },

  // Button management
  selectButton: (buttonId) => {
    if (buttonId === null) {
      set({ selectedButtonId: null, editingButton: null });
      return;
    }

    const { profiles, activeProfileId, activePageId } = get();
    const profile = profiles.find((p) => p.id === activeProfileId);
    const page = profile?.pages.find((pg) => pg.id === activePageId);
    const button = page?.buttons.find((b) => b.id === buttonId);

    set({
      selectedButtonId: buttonId,
      editingButton: button ? { ...button } : null,
    });
  },

  updateButton: (buttonId, updates) => {
    set((state) => ({
      profiles: state.profiles.map((p) => {
        if (p.id === state.activeProfileId) {
          return {
            ...p,
            pages: p.pages.map((pg) => {
              if (pg.id === state.activePageId) {
                return {
                  ...pg,
                  buttons: pg.buttons.map((b) =>
                    b.id === buttonId ? { ...b, ...updates } : b
                  ),
                };
              }
              return pg;
            }),
          };
        }
        return p;
      }),
      editingButton:
        state.selectedButtonId === buttonId && state.editingButton
          ? { ...state.editingButton, ...updates }
          : state.editingButton,
    }));
    get().saveToStore();
  },

  addActionToButton: (buttonId, action) => {
    const { profiles, activeProfileId, activePageId } = get();
    const profile = profiles.find((p) => p.id === activeProfileId);
    const page = profile?.pages.find((pg) => pg.id === activePageId);
    const button = page?.buttons.find((b) => b.id === buttonId);

    if (button) {
      get().updateButton(buttonId, {
        actions: [...button.actions, action],
      });
    }
  },

  removeActionFromButton: (buttonId, actionIndex) => {
    const { profiles, activeProfileId, activePageId } = get();
    const profile = profiles.find((p) => p.id === activeProfileId);
    const page = profile?.pages.find((pg) => pg.id === activePageId);
    const button = page?.buttons.find((b) => b.id === buttonId);

    if (button) {
      get().updateButton(buttonId, {
        actions: button.actions.filter((_, i) => i !== actionIndex),
      });
    }
  },

  // Settings
  updateSettings: (updates) => {
    set((state) => ({
      settings: { ...state.settings, ...updates },
    }));
    get().saveToStore();
  },

  toggleSettings: () => set((state) => ({ showSettings: !state.showSettings })),
  toggleSetupWizard: () => set((state) => ({ showSetupWizard: !state.showSetupWizard })),

  // Bridge
  setBridgeStatus: (status) => set({ bridgeStatus: status }),

  // Plugins
  setPlugins: (plugins) => set({ plugins }),
}));
