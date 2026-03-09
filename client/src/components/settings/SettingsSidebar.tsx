import { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '../ui/sheet';
import { Settings, Sliders, Code } from 'lucide-react';
import { GeneralSettings } from './GeneralSettings';
import { ModelsSettings } from './ModelsSettings';
import { AdvancedSettingsTab } from './AdvancedSettingsTab';

interface SettingsSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  streamStatus: 'connecting' | 'connected' | 'disconnected';
  cancelWord?: string;
  onCancelWordChange?: (word: string) => void;
}

type TabType = 'general' | 'models' | 'advanced';

export function SettingsSidebar({
  isOpen,
  onClose,
  streamStatus,
  cancelWord = 'cancel',
  onCancelWordChange,
}: SettingsSidebarProps) {
  const [activeTab, setActiveTab] = useState<TabType>('general');

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Settings
          </SheetTitle>
        </SheetHeader>

        {/* Tabs */}
        <div className="mt-6 border-b">
          <div className="flex space-x-1">
            <button
              onClick={() => setActiveTab('general')}
              className={`flex items-center gap-2 px-4 py-2 font-medium transition-colors text-sm ${
                activeTab === 'general'
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Sliders className="w-4 h-4" />
              General
            </button>
            <button
              onClick={() => setActiveTab('models')}
              className={`flex items-center gap-2 px-4 py-2 font-medium transition-colors text-sm ${
                activeTab === 'models'
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Code className="w-4 h-4" />
              Models
            </button>
            <button
              onClick={() => setActiveTab('advanced')}
              className={`flex items-center gap-2 px-4 py-2 font-medium transition-colors text-sm ${
                activeTab === 'advanced'
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Settings className="w-4 h-4" />
              Advanced
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="mt-6 pb-6">
          {activeTab === 'general' && (
            <GeneralSettings
              streamStatus={streamStatus}
              cancelWord={cancelWord}
              onCancelWordChange={onCancelWordChange}
            />
          )}
          {activeTab === 'models' && <ModelsSettings />}
          {activeTab === 'advanced' && <AdvancedSettingsTab />}
        </div>
      </SheetContent>
    </Sheet>
  );
}
