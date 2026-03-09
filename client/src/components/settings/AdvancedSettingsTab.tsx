import { PromptEditor } from '../PromptEditor';

/**
 * AdvancedSettingsTab Component
 *
 * Contains advanced settings like:
 * - Custom prompt editing
 * - Developer options
 * - Debug settings
 */
export function AdvancedSettingsTab() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold mb-2">Custom Prompts</h3>
        <p className="text-xs text-muted-foreground mb-4">
          Customize the AI prompts used throughout VerbaDeck. Changes are saved automatically.
        </p>
      </div>

      {/* Prompt Editor */}
      <PromptEditor />

      {/* Debug Settings - Placeholder for future */}
      <div className="border-t pt-6">
        <h3 className="text-sm font-semibold mb-3">Debug Settings</h3>
        <p className="text-xs text-muted-foreground">
          Developer options and debug settings coming soon.
        </p>
      </div>
    </div>
  );
}
