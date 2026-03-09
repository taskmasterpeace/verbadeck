import { AdvancedSettings } from '../AdvancedSettings';

/**
 * ModelsSettings Component
 *
 * Wrapper around the existing AdvancedSettings component
 * to display AI model configuration in the Settings Sidebar.
 */
export function ModelsSettings() {
  return (
    <div className="space-y-4">
      <div className="mb-4">
        <p className="text-sm text-muted-foreground">
          Configure AI models for different operations. Use presets for quick setup or customize each operation individually.
        </p>
      </div>
      <AdvancedSettings />
    </div>
  );
}
