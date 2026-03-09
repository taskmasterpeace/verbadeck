/**
 * Storage Migration System
 *
 * Handles migration from old localStorage format (App.tsx state) to new Zustand stores
 * Version tracking: V1 (old App.tsx) → V2 (Zustand stores)
 */

import type { Section } from './script-parser';
import type { PresentationStyle } from '../components/PresentationStyleManager';
import type { PresentationData } from './file-storage';

// Migration version constants
export const STORAGE_VERSION_KEY = 'verbadeck-storage-version';
export const STORAGE_BACKUP_KEY = 'verbadeck-storage-backup';
export const CURRENT_VERSION = 2;

// Old localStorage keys (V1)
const OLD_KEYS = {
  SELECTED_MODEL: 'verbadeck-selected-model',
  OPERATION_MODELS: 'verbadeck-operation-models',
  SHARED_KNOWLEDGE_BASE: 'verbadeck-shared-knowledge-base',
  CANCEL_WORD: 'verbadeck-cancel-word',
  PRESENTATION_STYLE: 'verbadeck-presentation-style',
  AUTOSAVE: 'verbadeck-autosave',
} as const;

// New Zustand store keys (V2)
const NEW_KEYS = {
  PRESENTATION_STORE: 'verbadeck-presentation-store',
  UI_STORE: 'verbadeck-ui-store',
  VOICE_STORE: 'verbadeck-voice-store',
  QA_STORE: 'verbadeck-qa-store',
} as const;

// Keys that should be preserved as-is (no migration needed)
const PRESERVE_KEYS = [
  'verbadeck-kia-', // Know It All presets (prefix match)
  'verbadeck-autosave',
  'verbadeck-presentation-library',
] as const;

export interface MigrationResult {
  success: boolean;
  version: number;
  migratedKeys: string[];
  errors: string[];
  backup?: Record<string, string>;
}

export interface OldStorageFormat {
  selectedModel?: string;
  operationModels?: Record<string, string>;
  sharedKnowledgeBase?: string;
  cancelWord?: string;
  presentationStyle?: PresentationStyle | null;
  autosave?: PresentationData;
}

export interface NewStorageFormat {
  presentation: {
    sections: Section[];
    currentSectionIndex: number;
    knowledgeBase: { question: string; answer: string }[];
    presentationStyle: PresentationStyle | null;
    sharedKnowledgeBase: string;
    selectedModel: string;
    selectedTone: string;
    cancelWord: string;
    operationModels: Record<string, string>;
  };
  ui: {
    viewMode: string;
    editorTab: string;
  };
}

/**
 * Check current storage version
 */
export function getStorageVersion(): number {
  try {
    const version = localStorage.getItem(STORAGE_VERSION_KEY);
    if (!version) return 1;
    const parsed = parseInt(version, 10);
    return isNaN(parsed) ? 1 : parsed;
  } catch (error) {
    console.error('Error reading storage version:', error);
    return 1;
  }
}

/**
 * Set storage version
 */
export function setStorageVersion(version: number): void {
  try {
    localStorage.setItem(STORAGE_VERSION_KEY, version.toString());
  } catch (error) {
    console.error('Error setting storage version:', error);
  }
}

/**
 * Check if migration is needed
 */
export function needsMigration(): boolean {
  const currentVersion = getStorageVersion();
  return currentVersion < CURRENT_VERSION;
}

/**
 * Create backup of old localStorage data
 */
export function createBackup(): Record<string, string> {
  const backup: Record<string, string> = {};

  try {
    // Backup all old format keys
    Object.values(OLD_KEYS).forEach((key) => {
      const value = localStorage.getItem(key);
      if (value !== null) {
        backup[key] = value;
      }
    });

    // Store backup
    localStorage.setItem(STORAGE_BACKUP_KEY, JSON.stringify({
      timestamp: new Date().toISOString(),
      version: getStorageVersion(),
      data: backup,
    }));

    console.log('📦 Created storage backup with', Object.keys(backup).length, 'keys');
  } catch (error) {
    console.error('Error creating backup:', error);
  }

  return backup;
}

/**
 * Restore from backup
 */
export function restoreBackup(): boolean {
  try {
    const backupStr = localStorage.getItem(STORAGE_BACKUP_KEY);
    if (!backupStr) {
      console.warn('No backup found to restore');
      return false;
    }

    const backup = JSON.parse(backupStr);

    // Restore all backed up keys
    Object.entries(backup.data).forEach(([key, value]) => {
      localStorage.setItem(key, value as string);
    });

    console.log('♻️ Restored backup from', backup.timestamp);
    return true;
  } catch (error) {
    console.error('Error restoring backup:', error);
    return false;
  }
}

/**
 * Read old localStorage format
 */
export function readOldFormat(): OldStorageFormat {
  const old: OldStorageFormat = {};

  try {
    // Read selected model
    const selectedModel = localStorage.getItem(OLD_KEYS.SELECTED_MODEL);
    if (selectedModel) {
      old.selectedModel = selectedModel;
    }

    // Read operation models
    const operationModels = localStorage.getItem(OLD_KEYS.OPERATION_MODELS);
    if (operationModels) {
      old.operationModels = JSON.parse(operationModels);
    }

    // Read shared knowledge base
    const sharedKnowledgeBase = localStorage.getItem(OLD_KEYS.SHARED_KNOWLEDGE_BASE);
    if (sharedKnowledgeBase) {
      old.sharedKnowledgeBase = sharedKnowledgeBase;
    }

    // Read cancel word
    const cancelWord = localStorage.getItem(OLD_KEYS.CANCEL_WORD);
    if (cancelWord) {
      old.cancelWord = cancelWord;
    }

    // Read presentation style
    const presentationStyle = localStorage.getItem(OLD_KEYS.PRESENTATION_STYLE);
    if (presentationStyle) {
      try {
        old.presentationStyle = JSON.parse(presentationStyle);
      } catch {
        old.presentationStyle = null;
      }
    }

    // Read autosave
    const autosave = localStorage.getItem(OLD_KEYS.AUTOSAVE);
    if (autosave) {
      try {
        old.autosave = JSON.parse(autosave);
      } catch {
        // Ignore invalid autosave data
      }
    }
  } catch (error) {
    console.error('Error reading old format:', error);
  }

  return old;
}

/**
 * Migrate presentation data to presentationStore
 */
export function migratePresentation(oldData: OldStorageFormat): Partial<NewStorageFormat['presentation']> {
  const migrated: Partial<NewStorageFormat['presentation']> = {};

  // Migrate from autosave if available
  if (oldData.autosave) {
    migrated.sections = oldData.autosave.sections || [];
    migrated.currentSectionIndex = oldData.autosave.settings?.currentSectionIndex || 0;
    migrated.knowledgeBase = oldData.autosave.knowledgeBase || [];
    migrated.selectedTone = oldData.autosave.settings?.selectedTone || 'professional';
  } else {
    // Default empty state
    migrated.sections = [];
    migrated.currentSectionIndex = 0;
    migrated.knowledgeBase = [];
    migrated.selectedTone = 'professional';
  }

  // Migrate settings
  migrated.selectedModel = oldData.selectedModel || 'openai/gpt-4o-mini';
  migrated.operationModels = oldData.operationModels || {};
  migrated.sharedKnowledgeBase = oldData.sharedKnowledgeBase || '';
  migrated.cancelWord = oldData.cancelWord || 'cancel';
  migrated.presentationStyle = oldData.presentationStyle || null;

  return migrated;
}

/**
 * Migrate settings to UIStore
 */
export function migrateSettings(oldData: OldStorageFormat): Partial<NewStorageFormat['ui']> {
  const migrated: Partial<NewStorageFormat['ui']> = {};

  // Migrate from autosave if available
  if (oldData.autosave?.settings) {
    const viewMode = oldData.autosave.settings.viewMode;
    if (viewMode && ['create', 'ai-processor', 'editor', 'presenter', 'create-from-scratch', 'know-it-all'].includes(viewMode)) {
      migrated.viewMode = viewMode;
    }
  }

  // Default values
  migrated.viewMode = migrated.viewMode || 'create';
  migrated.editorTab = 'sections';

  return migrated;
}

/**
 * Write data to new Zustand store format
 */
export function writeNewFormat(presentation: Partial<NewStorageFormat['presentation']>, ui: Partial<NewStorageFormat['ui']>): void {
  try {
    // Read existing stores to preserve any data
    const existingPresentation = localStorage.getItem(NEW_KEYS.PRESENTATION_STORE);
    const existingUI = localStorage.getItem(NEW_KEYS.UI_STORE);

    // Merge with migrated data (migrated data takes precedence)
    const presentationStore = existingPresentation ? JSON.parse(existingPresentation) : {};
    const uiStore = existingUI ? JSON.parse(existingUI) : {};

    // Update stores
    presentationStore.state = {
      ...presentationStore.state,
      ...presentation,
    };

    uiStore.state = {
      ...uiStore.state,
      ...ui,
    };

    // Write back to localStorage
    localStorage.setItem(NEW_KEYS.PRESENTATION_STORE, JSON.stringify(presentationStore));
    localStorage.setItem(NEW_KEYS.UI_STORE, JSON.stringify(uiStore));

    console.log('✅ Wrote new format to Zustand stores');
  } catch (error) {
    console.error('Error writing new format:', error);
    throw error;
  }
}

/**
 * Clean up old localStorage keys after successful migration
 */
export function cleanupOldKeys(): void {
  try {
    const keysToRemove = Object.values(OLD_KEYS).filter(
      (key) => key !== OLD_KEYS.AUTOSAVE // Keep autosave for now
    );

    keysToRemove.forEach((key) => {
      localStorage.removeItem(key);
    });

    console.log('🧹 Cleaned up', keysToRemove.length, 'old storage keys');
  } catch (error) {
    console.error('Error cleaning up old keys:', error);
  }
}

/**
 * Main migration function
 */
export function runMigration(): MigrationResult {
  const result: MigrationResult = {
    success: false,
    version: getStorageVersion(),
    migratedKeys: [],
    errors: [],
  };

  console.log('🔄 Starting storage migration from V' + result.version + ' to V' + CURRENT_VERSION);

  try {
    // Step 1: Check if migration is needed
    if (!needsMigration()) {
      console.log('✅ Storage is already at current version V' + CURRENT_VERSION);
      result.success = true;
      return result;
    }

    // Step 2: Create backup
    result.backup = createBackup();

    // Step 3: Read old format
    const oldData = readOldFormat();
    console.log('📖 Read old format:', Object.keys(oldData));

    // Step 4: Migrate data
    const presentation = migratePresentation(oldData);
    const ui = migrateSettings(oldData);

    // Step 5: Write new format
    writeNewFormat(presentation, ui);

    // Step 6: Track migrated keys - map data keys back to localStorage keys
    result.migratedKeys = Object.keys(oldData).map((key) => {
      // Map data keys back to localStorage key names
      const keyMap: Record<string, string> = {
        'selectedModel': OLD_KEYS.SELECTED_MODEL,
        'operationModels': OLD_KEYS.OPERATION_MODELS,
        'sharedKnowledgeBase': OLD_KEYS.SHARED_KNOWLEDGE_BASE,
        'cancelWord': OLD_KEYS.CANCEL_WORD,
        'presentationStyle': OLD_KEYS.PRESENTATION_STYLE,
        'autosave': OLD_KEYS.AUTOSAVE,
      };
      return keyMap[key] || key;
    });

    // Step 7: Clean up old keys
    cleanupOldKeys();

    // Step 8: Update version
    setStorageVersion(CURRENT_VERSION);

    result.success = true;
    console.log('✅ Migration completed successfully!');
    console.log('   Migrated keys:', result.migratedKeys.join(', '));
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    result.errors.push(errorMessage);
    console.error('❌ Migration failed:', errorMessage);

    // Attempt to restore backup
    console.log('♻️ Attempting to restore backup...');
    const restored = restoreBackup();
    if (restored) {
      console.log('✅ Backup restored successfully');
    } else {
      console.error('❌ Failed to restore backup');
    }
  }

  return result;
}

/**
 * Check if a key should be preserved during migration
 */
export function shouldPreserveKey(key: string): boolean {
  return PRESERVE_KEYS.some((prefix) => key.startsWith(prefix));
}

/**
 * Get migration status summary
 */
export function getMigrationStatus(): {
  version: number;
  needsMigration: boolean;
  hasBackup: boolean;
  oldKeysPresent: string[];
} {
  const version = getStorageVersion();
  const hasBackup = localStorage.getItem(STORAGE_BACKUP_KEY) !== null;
  const oldKeysPresent: string[] = [];

  Object.values(OLD_KEYS).forEach((key) => {
    if (localStorage.getItem(key) !== null) {
      oldKeysPresent.push(key);
    }
  });

  return {
    version,
    needsMigration: needsMigration(),
    hasBackup,
    oldKeysPresent,
  };
}

/**
 * Force migration (for testing)
 */
export function forceMigration(): MigrationResult {
  setStorageVersion(1); // Reset to V1
  return runMigration();
}

/**
 * Reset all storage (for testing)
 */
export function resetAllStorage(): void {
  // Get all keys first (before removing them)
  const allKeys: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('verbadeck-')) {
      allKeys.push(key);
    }
  }

  // Remove all VerbaDeck keys
  allKeys.forEach((key) => {
    localStorage.removeItem(key);
  });

  console.log('🗑️ Reset all VerbaDeck storage');
}
