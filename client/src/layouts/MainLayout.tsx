import { ReactNode, useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  useSidebar,
} from '../components/ui/sidebar';
import {
  Home,
  Sparkles,
  Edit,
  Presentation,
  MessageCircle,
  BookOpen,
  ChevronDown,
  Settings,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { SettingsSidebar } from '../components/settings/SettingsSidebar';
import { useVoiceStore } from '../stores/voice';
import { usePresentationStore } from '../stores/usePresentationStore';

interface MainLayoutProps {
  children: ReactNode;
  topBar?: ReactNode;
  transcriptBar?: ReactNode;
}

// Navigation items configuration
const navigationItems = [
  {
    title: 'Dashboard',
    icon: Home,
    to: '/',
    exact: true,
  },
  {
    title: 'Create',
    icon: Sparkles,
    to: '/create',
    subItems: [
      {
        title: 'From Scratch',
        to: '/create/scratch',
      },
      {
        title: 'Process Content',
        to: '/create/process',
      },
    ],
  },
  {
    title: 'Editor',
    icon: Edit,
    to: '/editor',
  },
  {
    title: 'Presenter',
    icon: Presentation,
    to: '/presenter',
  },
  {
    title: 'Know It All Wall',
    icon: MessageCircle,
    to: '/know-it-all',
  },
  {
    title: 'Library',
    icon: BookOpen,
    to: '/library',
  },
];

function SidebarNav() {
  const location = useLocation();
  const { state } = useSidebar();
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    Create: true,
  });

  const toggleGroup = (title: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  const isActive = (to: string, exact?: boolean) => {
    if (exact) {
      return location.pathname === to;
    }
    return location.pathname.startsWith(to);
  };

  const isGroupActive = (item: typeof navigationItems[0]) => {
    if (item.subItems) {
      return item.subItems.some(sub => location.pathname === sub.to);
    }
    return isActive(item.to, item.exact);
  };

  return (
    <>
      <SidebarHeader className="border-b">
        <div className="flex items-center gap-2 px-2 py-2">
          <img src="/logo-icon.png" alt="VerbaDeck" className="size-8 rounded-lg object-contain ring-1 ring-sidebar-border" />
          {state === 'expanded' && (
            <div className="flex flex-col gap-0.5 leading-none">
              <span className="font-heading font-bold text-base bg-gradient-to-r from-brand-light to-brand-teal bg-clip-text text-transparent">VerbaDeck</span>
              <span className="text-[11px] font-medium tracking-wide text-sidebar-foreground/55">Voice-Driven Presentations</span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const active = isGroupActive(item);

                if (item.subItems) {
                  const isExpanded = expandedGroups[item.title];

                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        isActive={active}
                        onClick={() => toggleGroup(item.title)}
                        tooltip={state === 'collapsed' ? item.title : undefined}
                      >
                        <Icon className="size-4" />
                        <span>{item.title}</span>
                        <ChevronDown
                          className={cn(
                            'ml-auto size-4 transition-transform',
                            isExpanded && 'rotate-180'
                          )}
                        />
                      </SidebarMenuButton>
                      {isExpanded && (
                        <SidebarMenuSub>
                          {item.subItems.map((subItem) => (
                            <SidebarMenuSubItem key={subItem.to}>
                              <SidebarMenuSubButton
                                asChild
                                isActive={location.pathname === subItem.to}
                              >
                                <NavLink to={subItem.to}>
                                  <span>{subItem.title}</span>
                                </NavLink>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      )}
                    </SidebarMenuItem>
                  );
                }

                return (
                  <SidebarMenuItem key={item.to}>
                    <SidebarMenuButton
                      asChild
                      isActive={active}
                      tooltip={state === 'collapsed' ? item.title : undefined}
                    >
                      <NavLink to={item.to}>
                        <Icon className="size-4" />
                        <span>{item.title}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => {
                // Access parent component's setShowSettings via context or prop
                const event = new CustomEvent('open-settings');
                window.dispatchEvent(event);
              }}
              tooltip={state === 'collapsed' ? 'Settings' : undefined}
            >
              <Settings className="size-4" />
              <span>Settings</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <div className="px-2 py-2 text-xs text-sidebar-foreground/55">
              {state === 'expanded' ? (
                <div className="flex flex-col gap-1">
                  <div className="text-[10px]">
                    Press <kbd className="px-1 py-0.5 bg-sidebar-accent border border-sidebar-border rounded text-[9px] font-mono text-sidebar-foreground">Ctrl+/</kbd> for shortcuts
                  </div>
                  <div className="font-mono text-[10px] text-sidebar-foreground/40">v1.0.0</div>
                </div>
              ) : (
                <div className="text-center font-mono text-[10px]">1.0</div>
              )}
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </>
  );
}

export function MainLayout({ children, topBar, transcriptBar }: MainLayoutProps) {
  // Read initial sidebar state from localStorage
  const [defaultOpen, _setDefaultOpen] = useState(() => {
    const saved = localStorage.getItem('verbadeck-sidebar-open');
    return saved ? saved === 'true' : true;
  });

  // Settings sidebar state
  const [showSettings, setShowSettings] = useState(false);

  // Get voice and presentation data from stores
  const streamStatus = useVoiceStore((state) => state.status);
  const cancelWord = usePresentationStore((state) => state.cancelWord);
  const setCancelWord = usePresentationStore((state) => state.setCancelWord);

  // Persist sidebar state to localStorage
  const handleOpenChange = (open: boolean) => {
    localStorage.setItem('verbadeck-sidebar-open', String(open));
  };

  // Listen for settings open event from sidebar button
  useEffect(() => {
    const handleOpenSettings = () => setShowSettings(true);
    window.addEventListener('open-settings', handleOpenSettings);
    return () => window.removeEventListener('open-settings', handleOpenSettings);
  }, []);

  return (
    <SidebarProvider defaultOpen={defaultOpen} onOpenChange={handleOpenChange}>
      <Sidebar collapsible="icon">
        <SidebarNav />
      </Sidebar>
      <SidebarInset className="flex flex-col">
        {topBar && <div className="sticky top-0 z-40">{topBar}</div>}
        <div className="flex-1 overflow-auto">{children}</div>
        {transcriptBar && (
          <div className="sticky bottom-0 z-40 border-t bg-background">
            {transcriptBar}
          </div>
        )}
      </SidebarInset>

      {/* Settings Sidebar */}
      <SettingsSidebar
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        streamStatus={streamStatus}
        cancelWord={cancelWord}
        onCancelWordChange={setCancelWord}
      />
    </SidebarProvider>
  );
}
