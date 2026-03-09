/**
 * Storage Migration Tests
 *
 * Tests for the storage migration system from V1 (old App.tsx) to V2 (Zustand stores)
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  getStorageVersion,
  setStorageVersion,
  needsMigration,
  createBackup,
  restoreBackup,
  readOldFormat,
  migratePresentation,
  migrateSettings,
  writeNewFormat,
  cleanupOldKeys,
  runMigration,
  shouldPreserveKey,
  getMigrationStatus,
  resetAllStorage,
  STORAGE_VERSION_KEY,
  STORAGE_BACKUP_KEY,
  CURRENT_VERSION,
  type OldStorageFormat,
} from './storage-migration';
import type { Section } from './script-parser';
import type { PresentationData } from './file-storage';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
    get length() {
      return Object.keys(store).length;
    },
    key: (index: number) => Object.keys(store)[index] || null,
  };
})();

// Replace global localStorage
Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

describe('Storage Migration', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  afterEach(() => {
    localStorageMock.clear();
  });

  describe('Version Management', () => {
    it('should return version 1 for new storage', () => {
      expect(getStorageVersion()).toBe(1);
    });

    it('should set and get storage version', () => {
      setStorageVersion(2);
      expect(getStorageVersion()).toBe(2);
      expect(localStorage.getItem(STORAGE_VERSION_KEY)).toBe('2');
    });

    it('should detect when migration is needed', () => {
      setStorageVersion(1);
      expect(needsMigration()).toBe(true);

      setStorageVersion(CURRENT_VERSION);
      expect(needsMigration()).toBe(false);
    });

    it('should handle invalid version string', () => {
      localStorage.setItem(STORAGE_VERSION_KEY, 'invalid');
      expect(getStorageVersion()).toBe(1); // Falls back to default
    });
  });

  describe('Backup and Restore', () => {
    it('should create backup of old storage', () => {
      // Set up old storage
      localStorage.setItem('verbadeck-selected-model', 'openai/gpt-4o');
      localStorage.setItem('verbadeck-cancel-word', 'stop');
      localStorage.setItem('verbadeck-operation-models', JSON.stringify({ qa: 'anthropic/claude-3.5-sonnet' }));

      const backup = createBackup();

      expect(backup['verbadeck-selected-model']).toBe('openai/gpt-4o');
      expect(backup['verbadeck-cancel-word']).toBe('stop');
      expect(backup['verbadeck-operation-models']).toBe(JSON.stringify({ qa: 'anthropic/claude-3.5-sonnet' }));

      // Check backup was stored
      const storedBackup = localStorage.getItem(STORAGE_BACKUP_KEY);
      expect(storedBackup).toBeTruthy();

      const parsed = JSON.parse(storedBackup!);
      expect(parsed.data).toEqual(backup);
      expect(parsed.version).toBe(1);
      expect(parsed.timestamp).toBeTruthy();
    });

    it('should restore from backup', () => {
      // Create backup
      const backupData = {
        'verbadeck-selected-model': 'openai/gpt-4o',
        'verbadeck-cancel-word': 'stop',
      };

      localStorage.setItem(STORAGE_BACKUP_KEY, JSON.stringify({
        timestamp: new Date().toISOString(),
        version: 1,
        data: backupData,
      }));

      // Clear old keys
      localStorage.removeItem('verbadeck-selected-model');
      localStorage.removeItem('verbadeck-cancel-word');

      // Restore
      const restored = restoreBackup();

      expect(restored).toBe(true);
      expect(localStorage.getItem('verbadeck-selected-model')).toBe('openai/gpt-4o');
      expect(localStorage.getItem('verbadeck-cancel-word')).toBe('stop');
    });

    it('should handle missing backup', () => {
      const restored = restoreBackup();
      expect(restored).toBe(false);
    });
  });

  describe('Read Old Format', () => {
    it('should read all old localStorage keys', () => {
      localStorage.setItem('verbadeck-selected-model', 'openai/gpt-4o-mini');
      localStorage.setItem('verbadeck-operation-models', JSON.stringify({ qa: 'anthropic/claude-3.5-sonnet' }));
      localStorage.setItem('verbadeck-shared-knowledge-base', 'Test KB');
      localStorage.setItem('verbadeck-cancel-word', 'stop');
      localStorage.setItem('verbadeck-presentation-style', JSON.stringify({ name: 'Modern', theme: 'dark' }));

      const old = readOldFormat();

      expect(old.selectedModel).toBe('openai/gpt-4o-mini');
      expect(old.operationModels).toEqual({ qa: 'anthropic/claude-3.5-sonnet' });
      expect(old.sharedKnowledgeBase).toBe('Test KB');
      expect(old.cancelWord).toBe('stop');
      expect(old.presentationStyle).toEqual({ name: 'Modern', theme: 'dark' });
    });

    it('should handle missing keys gracefully', () => {
      const old = readOldFormat();

      expect(old.selectedModel).toBeUndefined();
      expect(old.operationModels).toBeUndefined();
      expect(old.sharedKnowledgeBase).toBeUndefined();
      expect(old.cancelWord).toBeUndefined();
      expect(old.presentationStyle).toBeUndefined();
    });

    it('should read autosave data', () => {
      const autosaveData: PresentationData = {
        version: '1.0',
        title: 'Test Presentation',
        created: new Date().toISOString(),
        modified: new Date().toISOString(),
        sections: [
          {
            id: '1',
            content: 'Test content',
            advanceToken: 'next',
          },
        ],
        knowledgeBase: [{ question: 'Q1', answer: 'A1' }],
        settings: {
          selectedModel: 'openai/gpt-4o',
          selectedTone: 'casual',
          currentSectionIndex: 0,
        },
        metadata: {
          totalSlides: 1,
        },
      };

      localStorage.setItem('verbadeck-autosave', JSON.stringify(autosaveData));

      const old = readOldFormat();

      expect(old.autosave).toEqual(autosaveData);
    });

    it('should handle invalid JSON gracefully', () => {
      localStorage.setItem('verbadeck-operation-models', 'invalid json');
      localStorage.setItem('verbadeck-presentation-style', 'invalid json');

      const old = readOldFormat();

      // Should not throw, just skip invalid data
      expect(old.operationModels).toBeUndefined();
      expect(old.presentationStyle).toBeUndefined();
    });
  });

  describe('Migration Functions', () => {
    it('should migrate presentation data', () => {
      const oldData: OldStorageFormat = {
        selectedModel: 'openai/gpt-4o',
        operationModels: { qa: 'anthropic/claude-3.5-sonnet' },
        sharedKnowledgeBase: 'Test KB',
        cancelWord: 'stop',
        presentationStyle: { name: 'Modern', theme: 'dark' } as any,
      };

      const migrated = migratePresentation(oldData);

      expect(migrated.selectedModel).toBe('openai/gpt-4o');
      expect(migrated.operationModels).toEqual({ qa: 'anthropic/claude-3.5-sonnet' });
      expect(migrated.sharedKnowledgeBase).toBe('Test KB');
      expect(migrated.cancelWord).toBe('stop');
      expect(migrated.presentationStyle).toEqual({ name: 'Modern', theme: 'dark' });
      expect(migrated.sections).toEqual([]);
      expect(migrated.currentSectionIndex).toBe(0);
    });

    it('should migrate presentation data from autosave', () => {
      const sections: Section[] = [
        {
          id: '1',
          content: 'Section 1',
          advanceToken: 'next',
        },
        {
          id: '2',
          content: 'Section 2',
          advanceToken: 'continue',
        },
      ];

      const oldData: OldStorageFormat = {
        selectedModel: 'openai/gpt-4o-mini',
        autosave: {
          version: '1.0',
          title: 'Test',
          created: new Date().toISOString(),
          modified: new Date().toISOString(),
          sections,
          knowledgeBase: [{ question: 'Q1', answer: 'A1' }],
          settings: {
            selectedModel: 'openai/gpt-4o',
            selectedTone: 'casual',
            currentSectionIndex: 1,
          },
          metadata: {},
        },
      };

      const migrated = migratePresentation(oldData);

      expect(migrated.sections).toEqual(sections);
      expect(migrated.currentSectionIndex).toBe(1);
      expect(migrated.knowledgeBase).toEqual([{ question: 'Q1', answer: 'A1' }]);
      expect(migrated.selectedTone).toBe('casual');
    });

    it('should use default values when data is missing', () => {
      const oldData: OldStorageFormat = {};

      const migrated = migratePresentation(oldData);

      expect(migrated.selectedModel).toBe('openai/gpt-4o-mini');
      expect(migrated.operationModels).toEqual({});
      expect(migrated.sharedKnowledgeBase).toBe('');
      expect(migrated.cancelWord).toBe('cancel');
      expect(migrated.presentationStyle).toBeNull();
      expect(migrated.sections).toEqual([]);
      expect(migrated.selectedTone).toBe('professional');
    });

    it('should migrate UI settings', () => {
      const oldData: OldStorageFormat = {
        autosave: {
          version: '1.0',
          title: 'Test',
          created: new Date().toISOString(),
          modified: new Date().toISOString(),
          sections: [],
          settings: {
            viewMode: 'editor',
          },
          metadata: {},
        },
      };

      const migrated = migrateSettings(oldData);

      expect(migrated.viewMode).toBe('editor');
      expect(migrated.editorTab).toBe('sections');
    });

    it('should use default UI settings when missing', () => {
      const oldData: OldStorageFormat = {};

      const migrated = migrateSettings(oldData);

      expect(migrated.viewMode).toBe('create');
      expect(migrated.editorTab).toBe('sections');
    });

    it('should validate viewMode values', () => {
      const oldData: OldStorageFormat = {
        autosave: {
          version: '1.0',
          title: 'Test',
          created: new Date().toISOString(),
          modified: new Date().toISOString(),
          sections: [],
          settings: {
            viewMode: 'invalid-mode',
          },
          metadata: {},
        },
      };

      const migrated = migrateSettings(oldData);

      expect(migrated.viewMode).toBe('create'); // Falls back to default
    });
  });

  describe('Write New Format', () => {
    it('should write to Zustand store format', () => {
      const presentation = {
        selectedModel: 'openai/gpt-4o',
        sections: [],
        currentSectionIndex: 0,
      };

      const ui = {
        viewMode: 'editor',
        editorTab: 'sections',
      };

      writeNewFormat(presentation, ui);

      const presentationStore = JSON.parse(localStorage.getItem('verbadeck-presentation-store')!);
      const uiStore = JSON.parse(localStorage.getItem('verbadeck-ui-store')!);

      expect(presentationStore.state).toMatchObject(presentation);
      expect(uiStore.state).toMatchObject(ui);
    });

    it('should preserve existing store data', () => {
      // Set up existing store
      localStorage.setItem('verbadeck-presentation-store', JSON.stringify({
        state: {
          existingField: 'preserve me',
        },
        version: 1,
      }));

      const presentation = {
        selectedModel: 'openai/gpt-4o',
      };

      writeNewFormat(presentation, {});

      const presentationStore = JSON.parse(localStorage.getItem('verbadeck-presentation-store')!);

      expect(presentationStore.state.existingField).toBe('preserve me');
      expect(presentationStore.state.selectedModel).toBe('openai/gpt-4o');
    });
  });

  describe('Cleanup', () => {
    it('should clean up old localStorage keys', () => {
      localStorage.setItem('verbadeck-selected-model', 'openai/gpt-4o');
      localStorage.setItem('verbadeck-operation-models', '{}');
      localStorage.setItem('verbadeck-shared-knowledge-base', 'Test');
      localStorage.setItem('verbadeck-cancel-word', 'stop');
      localStorage.setItem('verbadeck-presentation-style', 'null');
      localStorage.setItem('verbadeck-autosave', '{}'); // Should be preserved

      cleanupOldKeys();

      expect(localStorage.getItem('verbadeck-selected-model')).toBeNull();
      expect(localStorage.getItem('verbadeck-operation-models')).toBeNull();
      expect(localStorage.getItem('verbadeck-shared-knowledge-base')).toBeNull();
      expect(localStorage.getItem('verbadeck-cancel-word')).toBeNull();
      expect(localStorage.getItem('verbadeck-presentation-style')).toBeNull();
      expect(localStorage.getItem('verbadeck-autosave')).toBe('{}'); // Preserved
    });
  });

  describe('Key Preservation', () => {
    it('should identify keys to preserve', () => {
      expect(shouldPreserveKey('verbadeck-kia-preset-1')).toBe(true);
      expect(shouldPreserveKey('verbadeck-kia-custom')).toBe(true);
      expect(shouldPreserveKey('verbadeck-autosave')).toBe(true);
      expect(shouldPreserveKey('verbadeck-presentation-library')).toBe(true);

      expect(shouldPreserveKey('verbadeck-selected-model')).toBe(false);
      expect(shouldPreserveKey('verbadeck-cancel-word')).toBe(false);
    });
  });

  describe('Full Migration', () => {
    it('should run complete migration successfully', () => {
      // Set up old storage (V1)
      setStorageVersion(1);
      localStorage.setItem('verbadeck-selected-model', 'openai/gpt-4o');
      localStorage.setItem('verbadeck-cancel-word', 'stop');
      localStorage.setItem('verbadeck-shared-knowledge-base', 'Test KB');

      const result = runMigration();

      expect(result.success).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.migratedKeys).toContain('verbadeck-selected-model');
      expect(getStorageVersion()).toBe(CURRENT_VERSION);

      // Check new stores were created
      const presentationStore = localStorage.getItem('verbadeck-presentation-store');
      expect(presentationStore).toBeTruthy();

      // Check old keys were cleaned up
      expect(localStorage.getItem('verbadeck-selected-model')).toBeNull();
      expect(localStorage.getItem('verbadeck-cancel-word')).toBeNull();
    });

    it('should skip migration if already at current version', () => {
      setStorageVersion(CURRENT_VERSION);

      const result = runMigration();

      expect(result.success).toBe(true);
      expect(result.migratedKeys).toHaveLength(0);
    });

    it('should restore backup on migration failure', () => {
      // Set up old storage
      localStorage.setItem('verbadeck-selected-model', 'openai/gpt-4o');

      // Force version to 1 to trigger migration
      setStorageVersion(1);

      // Mock writeNewFormat to throw error
      const originalSetItem = localStorage.setItem;
      let callCount = 0;
      localStorage.setItem = (key: string, value: string) => {
        // Let backup be created, but fail on store write
        if (key.includes('-store') && callCount === 0) {
          callCount++;
          throw new Error('Write failed');
        }
        return originalSetItem.call(localStorage, key, value);
      };

      const result = runMigration();

      // Restore original setItem
      localStorage.setItem = originalSetItem;

      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);

      // Backup should exist
      expect(localStorage.getItem(STORAGE_BACKUP_KEY)).toBeTruthy();
    });
  });

  describe('Migration Status', () => {
    it('should return current migration status', () => {
      setStorageVersion(1);
      localStorage.setItem('verbadeck-selected-model', 'openai/gpt-4o');
      localStorage.setItem('verbadeck-cancel-word', 'stop');

      const status = getMigrationStatus();

      expect(status.version).toBe(1);
      expect(status.needsMigration).toBe(true);
      expect(status.hasBackup).toBe(false);
      expect(status.oldKeysPresent).toContain('verbadeck-selected-model');
      expect(status.oldKeysPresent).toContain('verbadeck-cancel-word');
    });

    it('should detect backup presence', () => {
      createBackup();

      const status = getMigrationStatus();

      expect(status.hasBackup).toBe(true);
    });
  });

  describe('Reset Storage', () => {
    it('should reset all VerbaDeck storage', () => {
      localStorage.setItem('verbadeck-selected-model', 'test');
      localStorage.setItem('verbadeck-cancel-word', 'test');
      localStorage.setItem('verbadeck-presentation-store', 'test');
      localStorage.setItem('other-app-data', 'preserve');

      resetAllStorage();

      expect(localStorage.getItem('verbadeck-selected-model')).toBeNull();
      expect(localStorage.getItem('verbadeck-cancel-word')).toBeNull();
      expect(localStorage.getItem('verbadeck-presentation-store')).toBeNull();
      expect(localStorage.getItem('other-app-data')).toBe('preserve');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty autosave data', () => {
      localStorage.setItem('verbadeck-autosave', '{}');

      const old = readOldFormat();

      expect(old.autosave).toEqual({});
    });

    it('should handle partial autosave data', () => {
      const partialData = {
        version: '1.0',
        sections: [{ id: '1', content: 'Test', advanceToken: 'next' }],
      };

      localStorage.setItem('verbadeck-autosave', JSON.stringify(partialData));

      const old = readOldFormat();
      const migrated = migratePresentation(old);

      expect(migrated.sections).toHaveLength(1);
      expect(migrated.knowledgeBase).toEqual([]);
    });

    it('should handle migration with no old data', () => {
      setStorageVersion(1);

      const result = runMigration();

      expect(result.success).toBe(true);
      expect(getStorageVersion()).toBe(CURRENT_VERSION);
    });
  });
});
