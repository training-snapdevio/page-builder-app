import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import type { GlobalSettings } from "@/lib/settings.defaults";
import { DEFAULT_GLOBAL_SETTINGS } from "@/lib/settings.defaults";
import { applyCSSVariables, loadGoogleFont } from "@/puck-splat/utils";
import { isAtDefaultSettings, compareWithDefaults, getChangedCategories } from "@/puck-splat/utils/settings-helpers";

// ─── Types ────────────────────────────────────────────────────────────────────

export type SaveStatus = "idle" | "saving" | "saved" | "error";
export type ResetStatus = "idle" | "confirming" | "resetting" | "reset" | "error";

export interface GlobalSettingsContextValue {
  /** Current (possibly unsaved) settings state */
  settings: GlobalSettings;
  /**
   * Stable ref that always points to the latest settings.
   * Use when you need synchronous access (e.g. inside useCallback with [] deps).
   */
  settingsRef: React.RefObject<GlobalSettings>;
  /** Update a single field and flag the form as having unsaved changes. */
  updateSetting: <K extends keyof GlobalSettings>(field: K, value: GlobalSettings[K]) => void;
  /** Persist current settings to the backend. */
  saveSettings: () => Promise<void>;
  /** Reset all settings to the compiled-in defaults. */
  resetToDefaults: () => void;
  /** Check if current settings match defaults. */
  isAtDefaults: boolean;
  /** Current reset status for UI feedback. */
  resetStatus: ResetStatus;
  /** Request reset confirmation (opens modal). */
  requestResetConfirmation: () => void;
  /** Cancel reset confirmation (closes modal). */
  cancelResetConfirmation: () => void;
  /** Dismiss reset success/error notification. */
  dismissResetNotification: () => void;
  hasUnsaved: boolean;
  saveStatus: SaveStatus;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const GlobalSettingsContext = createContext<GlobalSettingsContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export interface GlobalSettingsProviderProps {
  initialSettings: GlobalSettings;
  onSave: (settings: GlobalSettings) => Promise<void>;
  children: React.ReactNode;
}

export function GlobalSettingsProvider({
  initialSettings,
  onSave,
  children,
}: GlobalSettingsProviderProps) {
  const [settings, setSettings] = useState<GlobalSettings>(initialSettings);
  const [hasUnsaved, setHasUnsaved] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [resetStatus, setResetStatus] = useState<ResetStatus>("idle");
  const [isAtDefaultsState, setIsAtDefaultsState] = useState(() => 
    isAtDefaultSettings(initialSettings)
  );

  // Stable refs for access inside callbacks with empty dependency arrays
  const settingsRef = useRef<GlobalSettings>(initialSettings);
  const onSaveRef = useRef(onSave);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    onSaveRef.current = onSave;
  }, [onSave]);

  // Apply CSS variables to the outer document whenever settings change.
  // The IframeThemeInjector (mounted inside the Puck canvas iframe) handles
  // injecting them into the preview frame on mount and every settings change.
  useEffect(() => {
    // Only apply CSS variables if DOM is ready
    if (typeof document !== "undefined" && document.readyState === "loading") {
      // DOM is still loading, wait for it to complete
      const handleDOMContentLoaded = () => {
        applyCSSVariables(settings);
        loadGoogleFont(settings.fontFamily);
        if (settings.headingFont !== settings.fontFamily) {
          loadGoogleFont(settings.headingFont);
        }
      };
      document.addEventListener("DOMContentLoaded", handleDOMContentLoaded);
      return () => {
        document.removeEventListener("DOMContentLoaded", handleDOMContentLoaded);
      };
    } else {
      // DOM is ready or we're in a non-browser environment
      applyCSSVariables(settings);
      loadGoogleFont(settings.fontFamily);
      if (settings.headingFont !== settings.fontFamily) {
        loadGoogleFont(settings.headingFont);
      }
    }
  }, [settings]);

  // One-time init: set data-theme on <html> and clean up the save timer.
  useEffect(() => {
    document.documentElement.setAttribute(
      "data-theme",
      initialSettings.theme ?? "light",
    );
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Callbacks (stable identity) ────────────────────────────────────────────

  const updateSetting = useCallback(
    <K extends keyof GlobalSettings>(field: K, value: GlobalSettings[K]): void => {
      const next = { ...settingsRef.current, [field]: value } as GlobalSettings;
      settingsRef.current = next;
      setSettings(next);
      setHasUnsaved(true);
    },
    [],
  );

  const saveSettings = useCallback(async () => {
    setSaveStatus("saving");
    try {
      await onSaveRef.current(settingsRef.current);
      setHasUnsaved(false);
      setSaveStatus("saved");
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(() => setSaveStatus("idle"), 2500);
    } catch {
      setSaveStatus("error");
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(() => setSaveStatus("idle"), 2500);
    }
  }, []);

  // ── Reset functionality with confirmation and feedback ──────────────────────

  const requestResetConfirmation = useCallback(() => {
    setResetStatus("confirming");
  }, []);

  const cancelResetConfirmation = useCallback(() => {
    setResetStatus("idle");
  }, []);

  const dismissResetNotification = useCallback(() => {
    setResetStatus("idle");
  }, []);

  const resetToDefaults = useCallback(() => {
    setResetStatus("resetting");
    
    try {
      // Create a deep copy of defaults to avoid reference issues
      const defaultsCopy = JSON.parse(JSON.stringify(DEFAULT_GLOBAL_SETTINGS));
      
      settingsRef.current = defaultsCopy;
      setSettings(defaultsCopy);
      setHasUnsaved(true);
      setIsAtDefaultsState(true);
      setResetStatus("reset");
      
      // Apply CSS variables immediately for instant feedback
      applyCSSVariables(defaultsCopy);
      loadGoogleFont(defaultsCopy.fontFamily);
      if (defaultsCopy.headingFont !== defaultsCopy.fontFamily) {
        loadGoogleFont(defaultsCopy.headingFont);
      }
      
      // Auto-dismiss success notification after 3 seconds
      setTimeout(() => {
        setResetStatus((prev) => (prev === "reset" ? "idle" : prev));
      }, 3000);
    } catch {
      setResetStatus("error");
    }
  }, []);

  // Update isAtDefaults when settings change
  useEffect(() => {
    setIsAtDefaultsState(isAtDefaultSettings(settings));
  }, [settings]);

  // ── Memoized context value ─────────────────────────────────────────────────

  const value = useMemo<GlobalSettingsContextValue>(
    () => ({
      settings,
      settingsRef,
      updateSetting,
      saveSettings,
      resetToDefaults,
      isAtDefaults: isAtDefaultsState,
      resetStatus,
      requestResetConfirmation,
      cancelResetConfirmation,
      dismissResetNotification,
      hasUnsaved,
      saveStatus,
    }),
    [settings, settingsRef, updateSetting, saveSettings, resetToDefaults, isAtDefaultsState, resetStatus, requestResetConfirmation, cancelResetConfirmation, dismissResetNotification, hasUnsaved, saveStatus],
  );

  return (
    <GlobalSettingsContext.Provider value={value}>
      {children}
    </GlobalSettingsContext.Provider>
  );
}

// ─── Consumer hook ─────────────────────────────────────────────────────────

export function useGlobalSettings(): GlobalSettingsContextValue {
  const ctx = useContext(GlobalSettingsContext);
  if (!ctx) {
    throw new Error(
      "useGlobalSettings() must be called inside <GlobalSettingsProvider>.",
    );
  }
  return ctx;
}
