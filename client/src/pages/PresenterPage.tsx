import { useState, useMemo } from 'react';
import { type Section } from '../lib/script-parser';
import { PresenterView } from '../components/PresenterView';
import { TransitionEffects } from '../components/TransitionEffects';
import { usePresenterRoom } from '../hooks/usePresenterRoom';
import { Smartphone, Wifi } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

interface PresenterPageProps {
  sections: Section[];
  currentSectionIndex: number;
  currentSection?: Section;
  previousSection?: Section;
  nextSection?: Section;
  shouldFlash: boolean;
  openAudienceView: () => void;
  goToSection: (index: number) => void;
  advanceSection: () => void;
  goBackSection: () => void;
  stopStreaming: () => void;
  isStreaming: boolean;
  viewMode: string;
}

export function PresenterPage({
  sections: _sections,
  currentSectionIndex,
  currentSection: _currentSection,
  previousSection: _previousSection,
  nextSection: _nextSection,
  shouldFlash,
  openAudienceView,
  goToSection,
  advanceSection,
  goBackSection,
  stopStreaming,
  isStreaming,
  viewMode: _viewMode,
}: PresenterPageProps) {
  const presenterRoom = usePresenterRoom();
  const [showQR, setShowQR] = useState(true);

  // Build the controller URL using the current hostname (LAN IP or localhost)
  const controllerUrl = useMemo(() => {
    if (!presenterRoom.roomCode) return '';
    const proto = window.location.protocol;
    const host = window.location.host;
    return `${proto}//${host}/controller?room=${presenterRoom.roomCode}`;
  }, [presenterRoom.roomCode]);

  return (
    <>
      {/* Pre-streaming controls: Audience View + Remote Control */}
      {!isStreaming && (
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-4">
          {/* Open Audience View Button - Monitor Style */}
          <button
            onClick={openAudienceView}
            className="group relative cursor-pointer transition-transform hover:scale-105 active:scale-95"
          >
            <div className="relative bg-gradient-to-b from-slate-800 to-slate-900 rounded-lg p-1 shadow-xl">
              <div className="bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 rounded-md px-8 py-6 min-w-[280px]">
                <div className="text-center">
                  <div className="text-white font-bold text-lg mb-1">Open Audience View</div>
                  <div className="text-blue-100 text-sm">Click to launch 2nd monitor</div>
                </div>
                <div className="absolute top-2 left-2 w-8 h-8 bg-white/10 rounded-full blur-sm" />
              </div>
              <div className="absolute bottom-2 right-3 w-2 h-2 rounded-full bg-green-400 shadow-[0_0_6px_2px_rgba(74,222,128,0.5)]" />
            </div>
            <div className="flex flex-col items-center">
              <div className="w-4 h-3 bg-gradient-to-b from-slate-700 to-slate-800" />
              <div className="w-16 h-2 bg-gradient-to-b from-slate-700 to-slate-800 rounded-b-md" />
            </div>
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
              Opens a clean view for your audience
            </div>
          </button>

          {/* Phone Remote Control */}
          <div className="flex flex-col items-center gap-2">
            {presenterRoom.isHosting && presenterRoom.roomCode ? (
              <div className="bg-gradient-to-b from-slate-800 to-slate-900 rounded-lg p-1 shadow-xl">
                <div className="bg-gradient-to-br from-green-600 via-green-700 to-emerald-800 rounded-md px-6 py-4 min-w-[200px]">
                  <div className="flex flex-col items-center gap-3">
                    <div className="flex items-center gap-2">
                      <Wifi className="w-4 h-4 text-green-200" />
                      <span className="text-green-100 text-xs font-medium">Remote Active</span>
                    </div>

                    {/* QR Code */}
                    {showQR && controllerUrl && (
                      <div className="bg-white p-2 rounded-lg">
                        <QRCodeSVG
                          value={controllerUrl}
                          size={140}
                          level="M"
                          bgColor="#ffffff"
                          fgColor="#000000"
                        />
                      </div>
                    )}

                    <div className="font-mono text-3xl font-bold text-white tracking-[0.3em]">
                      {presenterRoom.roomCode}
                    </div>

                    <div className="text-green-200 text-xs text-center leading-relaxed">
                      Scan QR code or enter code at /controller
                    </div>

                    <button
                      onClick={() => setShowQR(!showQR)}
                      className="text-green-300/60 text-xs hover:text-green-200 transition-colors"
                    >
                      {showQR ? 'Hide QR' : 'Show QR'}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <button
                onClick={presenterRoom.startHosting}
                className="group relative cursor-pointer transition-transform hover:scale-105 active:scale-95"
              >
                <div className="relative bg-gradient-to-b from-slate-800 to-slate-900 rounded-lg p-1 shadow-xl">
                  <div className="bg-gradient-to-br from-purple-500 via-purple-600 to-indigo-700 rounded-md px-8 py-6 min-w-[200px]">
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-2 mb-1">
                        <Smartphone className="w-5 h-5 text-white" />
                        <div className="text-white font-bold text-lg">Phone Remote</div>
                      </div>
                      <div className="text-purple-100 text-sm">Control from your phone</div>
                    </div>
                    <div className="absolute top-2 left-2 w-8 h-8 bg-white/10 rounded-full blur-sm" />
                  </div>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-4 h-3 bg-gradient-to-b from-slate-700 to-slate-800" />
                  <div className="w-16 h-2 bg-gradient-to-b from-slate-700 to-slate-800 rounded-b-md" />
                </div>
                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                  Use your phone as a wireless remote
                </div>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Room code indicator during streaming */}
      {isStreaming && presenterRoom.isHosting && presenterRoom.roomCode && (
        <div className="flex justify-center mb-2">
          <div className="flex items-center gap-2 bg-green-900/50 border border-green-700 px-3 py-1.5 rounded-lg">
            <Wifi className="w-4 h-4 text-green-400" />
            <span className="font-mono text-green-300 font-bold tracking-wider text-sm">{presenterRoom.roomCode}</span>
            <span className="text-green-400/60 text-xs">Remote</span>
          </div>
        </div>
      )}

      <TransitionEffects
        transitionKey={currentSectionIndex}
        shouldFlash={shouldFlash}
      >
        <PresenterView
          onSectionClick={goToSection}
          onNavigateNext={advanceSection}
          onNavigatePrev={goBackSection}
          onStopStreaming={stopStreaming}
        />
      </TransitionEffects>
    </>
  );
}
