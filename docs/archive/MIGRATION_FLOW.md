# Storage Migration Flow Diagram

## High-Level Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                      App Startup (main.tsx)                      │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                    ┌──────────────────┐
                    │ getMigrationStatus()│
                    └──────────────────┘
                              ↓
                    ┌──────────────────┐
                    │ Check Version    │
                    │ localStorage.    │
                    │ getItem('ver')   │
                    └──────────────────┘
                              ↓
                    ╱ Version < 2? ╲
                   ╱                 ╲
                  ╱                   ╲
                 ╱                     ╲
            ┌───────┐              ┌───────┐
            │  YES  │              │   NO  │
            └───────┘              └───────┘
                ↓                       ↓
        ┌─────────────┐         ┌─────────────┐
        │runMigration()│         │ Skip - V2   │
        └─────────────┘         │ Already     │
                                └─────────────┘
```

## Detailed Migration Process

```
┌────────────────────────────────────────────────────────────────────────┐
│                         runMigration()                                 │
└────────────────────────────────────────────────────────────────────────┘
                                  ↓
┌────────────────────────────────────────────────────────────────────────┐
│  Step 1: Create Backup                                                 │
│  ┌──────────────────────────────────────────────────────────────────┐ │
│  │ createBackup()                                                    │ │
│  │ - Read all old keys                                              │ │
│  │ - Store in verbadeck-storage-backup                             │ │
│  │ - Include timestamp and version                                 │ │
│  └──────────────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────────┘
                                  ↓
┌────────────────────────────────────────────────────────────────────────┐
│  Step 2: Read Old Format                                               │
│  ┌──────────────────────────────────────────────────────────────────┐ │
│  │ readOldFormat()                                                   │ │
│  │ ├─ verbadeck-selected-model                                      │ │
│  │ ├─ verbadeck-operation-models                                    │ │
│  │ ├─ verbadeck-shared-knowledge-base                               │ │
│  │ ├─ verbadeck-cancel-word                                         │ │
│  │ ├─ verbadeck-presentation-style                                  │ │
│  │ └─ verbadeck-autosave                                            │ │
│  └──────────────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────────┘
                                  ↓
┌────────────────────────────────────────────────────────────────────────┐
│  Step 3: Transform Data                                                │
│  ┌──────────────────────────────────────────────────────────────────┐ │
│  │ migratePresentation()                                             │ │
│  │ - Map old keys to store properties                               │ │
│  │ - Extract autosave data                                          │ │
│  │ - Apply default values                                           │ │
│  │                                                                   │ │
│  │ migrateSettings()                                                 │ │
│  │ - Extract viewMode from autosave                                 │ │
│  │ - Set default editorTab                                          │ │
│  └──────────────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────────┘
                                  ↓
┌────────────────────────────────────────────────────────────────────────┐
│  Step 4: Write New Format                                              │
│  ┌──────────────────────────────────────────────────────────────────┐ │
│  │ writeNewFormat()                                                  │ │
│  │ ├─ verbadeck-presentation-store                                  │ │
│  │ │  └─ { state: { ...presentationData } }                        │ │
│  │ └─ verbadeck-ui-store                                            │ │
│  │    └─ { state: { ...uiData } }                                  │ │
│  └──────────────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────────┘
                                  ↓
┌────────────────────────────────────────────────────────────────────────┐
│  Step 5: Cleanup                                                       │
│  ┌──────────────────────────────────────────────────────────────────┐ │
│  │ cleanupOldKeys()                                                  │ │
│  │ - Remove verbadeck-selected-model                                │ │
│  │ - Remove verbadeck-operation-models                              │ │
│  │ - Remove verbadeck-shared-knowledge-base                         │ │
│  │ - Remove verbadeck-cancel-word                                   │ │
│  │ - Remove verbadeck-presentation-style                            │ │
│  │ - Keep verbadeck-autosave (preserved)                            │ │
│  │ - Keep verbadeck-kia-* (preserved)                               │ │
│  └──────────────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────────┘
                                  ↓
┌────────────────────────────────────────────────────────────────────────┐
│  Step 6: Update Version                                                │
│  ┌──────────────────────────────────────────────────────────────────┐ │
│  │ setStorageVersion(2)                                              │ │
│  │ - Set verbadeck-storage-version = '2'                            │ │
│  └──────────────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────────┘
                                  ↓
                        ┌──────────────────┐
                        │   ✅ Success     │
                        └──────────────────┘
```

## Error Handling Flow

```
┌────────────────────────────────────────────────────────────────────────┐
│                         Error During Migration                         │
└────────────────────────────────────────────────────────────────────────┘
                                  ↓
                        ┌──────────────────┐
                        │  Catch Error     │
                        └──────────────────┘
                                  ↓
                        ┌──────────────────┐
                        │ Log Error to     │
                        │ Console          │
                        └──────────────────┘
                                  ↓
                        ┌──────────────────┐
                        │ restoreBackup()  │
                        └──────────────────┘
                                  ↓
                    ╱ Backup Exists? ╲
                   ╱                   ╲
              ┌───────┐            ┌───────┐
              │  YES  │            │   NO  │
              └───────┘            └───────┘
                  ↓                     ↓
        ┌─────────────────┐    ┌─────────────────┐
        │ Restore all     │    │ Log warning     │
        │ old keys from   │    │ Continue with   │
        │ backup          │    │ fresh state     │
        └─────────────────┘    └─────────────────┘
                  ↓                     ↓
        ┌─────────────────┐    ┌─────────────────┐
        │ ✅ User data    │    │ ⚠️  App works   │
        │    preserved    │    │    with defaults│
        └─────────────────┘    └─────────────────┘
```

## Data Mapping

```
┌─────────────────────────────────────────────────────────────────┐
│                        Old Format (V1)                          │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  verbadeck-selected-model: 'openai/gpt-4o'                      │
│  verbadeck-operation-models: { qa: 'claude-3.5-sonnet' }        │
│  verbadeck-shared-knowledge-base: 'KB text...'                  │
│  verbadeck-cancel-word: 'stop'                                  │
│  verbadeck-presentation-style: { name: 'Modern' }               │
│  verbadeck-autosave: {                                          │
│    sections: [...],                                             │
│    knowledgeBase: [...],                                        │
│    settings: { viewMode: 'editor', ... }                        │
│  }                                                               │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                    ┌──────────────────┐
                    │  Transform Data  │
                    └──────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                        New Format (V2)                          │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  verbadeck-presentation-store: {                                │
│    state: {                                                     │
│      selectedModel: 'openai/gpt-4o',           ←────────┐       │
│      operationModels: { qa: 'claude-3.5-sonnet' }, ←───┤       │
│      sharedKnowledgeBase: 'KB text...',        ←────────┤       │
│      cancelWord: 'stop',                       ←────────┤       │
│      presentationStyle: { name: 'Modern' },    ←────────┤       │
│      sections: [...],                          ←────────┤       │
│      knowledgeBase: [...],                     ←────────┤       │
│      selectedTone: 'professional',             ←────────┤       │
│      currentSectionIndex: 0                    ←────────┤       │
│    },                                                   │       │
│    version: 1                                           │       │
│  }                                                      │       │
│                                                         │       │
│  verbadeck-ui-store: {                                 │       │
│    state: {                                            │       │
│      viewMode: 'editor',                    ←──────────┘       │
│      editorTab: 'sections'                                     │
│    },                                                           │
│    version: 1                                                   │
│  }                                                               │
└─────────────────────────────────────────────────────────────────┘
```

## Version Lifecycle

```
┌─────────────────────────────────────────────────────────────────┐
│                      Version Timeline                            │
└─────────────────────────────────────────────────────────────────┘

V1 (Old)                    V2 (Current)              V3 (Future)
│                           │                         │
│ - Scattered keys          │ - Zustand stores        │ - TBD
│ - No version tracking     │ - Persisted state       │ - Compression?
│ - Manual sync             │ - Auto-migration        │ - IndexedDB?
│ - No backup               │ - Backup/restore        │
│                           │                         │
└───────┬───────────────────┴─────────────────────────┴───────────
        │
        │ Migration V1→V2
        └──────────────────→


User Data Flow:
───────────────

Fresh Install
│
└─► No old data
    │
    └─► Create V2 stores with defaults
        │
        └─► version = 2


Existing V1 User
│
├─► Has old keys
│   │
│   └─► Read old data
│       │
│       └─► Backup old data
│           │
│           └─► Transform to V2
│               │
│               └─► Write to stores
│                   │
│                   └─► Clean up old keys
│                       │
│                       └─► version = 2


Already V2 User
│
└─► version = 2
    │
    └─► Skip migration
        │
        └─► Load from stores
```

## Key Preservation Logic

```
┌─────────────────────────────────────────────────────────────────┐
│                    Key Decision Tree                             │
└─────────────────────────────────────────────────────────────────┘

For each localStorage key:
│
├─► Starts with 'verbadeck-'?
│   │
│   ├─► YES
│   │   │
│   │   ├─► Is it 'verbadeck-kia-*'?
│   │   │   │
│   │   │   ├─► YES → 🔒 PRESERVE (KIA preset)
│   │   │   │
│   │   │   └─► NO
│   │   │       │
│   │   │       ├─► Is it 'verbadeck-autosave'?
│   │   │       │   │
│   │   │       │   ├─► YES → 🔒 PRESERVE (temporary)
│   │   │       │   │
│   │   │       │   └─► NO
│   │   │       │       │
│   │   │       │       ├─► Is it 'verbadeck-presentation-library'?
│   │   │       │       │   │
│   │   │       │       │   ├─► YES → 🔒 PRESERVE
│   │   │       │       │   │
│   │   │       │       │   └─► NO
│   │   │       │       │       │
│   │   │       │       │       ├─► Is it old format key?
│   │   │       │       │       │   │
│   │   │       │       │       │   ├─► YES → 📦 MIGRATE
│   │   │       │       │       │   │            └─► 🗑️  DELETE
│   │   │       │       │       │   │
│   │   │       │       │       │   └─► NO → 🔒 PRESERVE
│   │
│   └─► NO → ⏭️  IGNORE (not VerbaDeck data)
```

## Performance Timeline

```
Time (ms)    Operation
───────────────────────────────────────────────────────────────
0            │ App starts
             │
5            ├─► getMigrationStatus()
             │   └─► Read version from localStorage
             │
10           ├─► needsMigration() = true
             │
15           ├─► runMigration() starts
             │   │
20           │   ├─► createBackup()
             │   │   └─► Read 5-10 keys
             │   │
35           │   ├─► readOldFormat()
             │   │   └─► Parse JSON data
             │   │
50           │   ├─► migratePresentation()
             │   │   └─► Transform data
             │   │
60           │   ├─► migrateSettings()
             │   │   └─► Extract settings
             │   │
75           │   ├─► writeNewFormat()
             │   │   └─► Write to 2 stores
             │   │
85           │   ├─► cleanupOldKeys()
             │   │   └─► Remove old keys
             │   │
90           │   └─► setStorageVersion(2)
             │
95           ├─► Migration complete
             │
100          └─► React app renders

Total: ~100ms (typical user)
       ~30ms  (no data)
       ~150ms (power user with large dataset)
```

## Backup Structure

```
verbadeck-storage-backup
│
└─► {
    │
    ├─► timestamp: "2025-11-09T21:52:26.418Z"
    │
    ├─► version: 1
    │
    └─► data: {
        │
        ├─► "verbadeck-selected-model": "openai/gpt-4o"
        │
        ├─► "verbadeck-operation-models": "{...}"
        │
        ├─► "verbadeck-shared-knowledge-base": "..."
        │
        ├─► "verbadeck-cancel-word": "stop"
        │
        └─► "verbadeck-presentation-style": "{...}"
    }
}
```

## Console Logging Flow

```
User Action          Log Level    Message
───────────────────────────────────────────────────────────────
App starts           INFO         "🔄 Storage migration needed..."
  ├─► Create backup  INFO         "📦 Created storage backup..."
  ├─► Read old       INFO         "📖 Read old format: [...]"
  ├─► Write new      INFO         "✅ Wrote new format..."
  ├─► Cleanup        INFO         "🧹 Cleaned up X old keys"
  └─► Complete       SUCCESS      "✅ Migration completed!"
                     INFO         "   Migrated keys: ..."

Error occurs         ERROR        "❌ Migration failed: ..."
  └─► Restore        INFO         "♻️ Attempting to restore..."
      └─► Success    SUCCESS      "✅ Backup restored"

Already V2           SUCCESS      "✅ Storage is up to date (V2)"
```

---

**Legend**:
- 📦 Backup operation
- 📖 Read operation
- ✅ Success
- ❌ Error
- 🔒 Preserved
- 🗑️  Deleted
- ♻️  Restore
- 🔄 Migration
- ⏭️  Skipped
