import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useControllerSocket } from '@/hooks/useControllerSocket';
import { ChevronLeft, ChevronRight, Wifi, WifiOff, MessageCircle, X, Loader2 } from 'lucide-react';

function PairingScreen({ onJoin, error }: { onJoin: (code: string) => void; error: string | null }) {
  const [code, setCode] = useState('');

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center p-6">
      <div className="text-center space-y-6 w-full max-w-sm">
        <div className="text-4xl">🎮</div>
        <h1 className="text-2xl font-bold">VerbaDeck Remote</h1>
        <p className="text-gray-400 text-sm">Enter the room code shown on the presenter's screen</p>

        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6))}
          placeholder="ABC123"
          maxLength={6}
          className="w-full text-center text-3xl font-mono tracking-[0.5em] bg-gray-800 border-2 border-gray-700 rounded-xl px-4 py-4 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500"
          autoFocus
        />

        <button
          onClick={() => code.length === 6 && onJoin(code)}
          disabled={code.length !== 6}
          className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:text-gray-500 rounded-xl text-lg font-semibold transition-colors"
        >
          Connect
        </button>

        {error && (
          <p className="text-red-400 text-sm">{error}</p>
        )}
      </div>
    </div>
  );
}

function RemoteControl({
  remoteState,
  isConnected,
  roomCode,
  sendNavigate,
  sendToggleQA,
  sendDismissQA,
}: {
  remoteState: any;
  isConnected: boolean;
  roomCode: string | null;
  sendNavigate: (dir: 'next' | 'prev') => void;
  sendToggleQA: (enabled: boolean) => void;
  sendDismissQA: () => void;
}) {
  const [qaActive, setQaActive] = useState(false);
  const [navFlash, setNavFlash] = useState<'next' | 'prev' | null>(null);

  // Screen wake lock
  useEffect(() => {
    let wakeLock: any = null;
    const requestWakeLock = async () => {
      try {
        if ('wakeLock' in navigator) {
          wakeLock = await (navigator as any).wakeLock.request('screen');
        }
      } catch {}
    };
    requestWakeLock();
    return () => { if (wakeLock) wakeLock.release(); };
  }, []);

  const handleNav = (dir: 'next' | 'prev') => {
    sendNavigate(dir);
    setNavFlash(dir);
    // Vibrate on nav
    if (navigator.vibrate) navigator.vibrate(30);
    setTimeout(() => setNavFlash(null), 200);
  };

  const handleToggleQA = () => {
    const next = !qaActive;
    setQaActive(next);
    sendToggleQA(next);
  };

  const currentIndex = remoteState?.currentIndex ?? 0;
  const totalSlides = remoteState?.totalSlides ?? 0;
  const sections = remoteState?.sections ?? [];
  const currentSection = sections[currentIndex];
  const qaState = remoteState?.qaState;

  // When qa state arrives from presenter, activate QA view
  useEffect(() => {
    if (qaState) setQaActive(true);
  }, [qaState]);

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      {/* Status Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-900 border-b border-gray-800">
        <span className="text-xs text-gray-400 font-mono">Room: {roomCode}</span>
        <div className="flex items-center gap-1.5">
          {isConnected ? (
            <><Wifi className="w-3.5 h-3.5 text-green-400" /><span className="text-xs text-green-400">Connected</span></>
          ) : (
            <><WifiOff className="w-3.5 h-3.5 text-red-400" /><span className="text-xs text-red-400">Disconnected</span></>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col p-4 overflow-y-auto">
        {/* Slide Info */}
        <div className="text-center mb-4">
          <div className="text-3xl font-bold text-blue-400">
            {currentIndex + 1} <span className="text-gray-600">/ {totalSlides}</span>
          </div>
          {currentSection?.heading && (
            <h2 className="text-lg font-medium text-gray-300 mt-1 truncate">{currentSection.heading}</h2>
          )}
        </div>

        {/* Q&A State */}
        {qaState && (
          <div className="mb-4 bg-gray-900 rounded-xl p-4 border border-blue-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-blue-400 uppercase">Live Question</span>
              <button onClick={() => { sendDismissQA(); setQaActive(false); }} className="text-gray-500 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-sm font-medium text-white">{qaState.question}</p>

            {qaState.isLoading ? (
              <div className="flex items-center gap-2 text-gray-400">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Generating answer...</span>
              </div>
            ) : qaState.answers ? (
              <div className="space-y-2">
                <div className="bg-green-900/30 border border-green-800 rounded-lg p-3">
                  <span className="text-xs font-semibold text-green-400">QUICK ANSWER</span>
                  <p className="text-sm text-gray-200 mt-1">{qaState.answers.answer1.brief}</p>
                </div>
                <div>
                  <span className="text-xs font-semibold text-blue-400">KEY POINTS</span>
                  <ul className="mt-1 space-y-0.5">
                    {(qaState.answers.answer1.bullets || []).map((b: string, i: number) => (
                      <li key={i} className="text-xs text-gray-300 flex gap-1.5">
                        <span className="text-blue-500">-</span><span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : null}
          </div>
        )}

        {/* Speaker Notes (abbreviated) */}
        {currentSection && !qaState && (
          <div className="bg-gray-900 rounded-xl p-4 border border-gray-800 flex-1">
            <span className="text-xs font-semibold text-gray-500 uppercase">Notes</span>
            <p className="text-sm text-gray-300 mt-2 leading-relaxed line-clamp-6">
              {currentSection.content}
            </p>
            {currentSection.advanceToken && (
              <div className="mt-3 pt-3 border-t border-gray-800">
                <span className="text-xs text-gray-500">Trigger: </span>
                <span className="text-xs font-mono text-yellow-400">{currentSection.advanceToken}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Controls */}
      <div className="p-4 bg-gray-900 border-t border-gray-800 space-y-3">
        {/* Q&A Toggle */}
        <button
          onClick={handleToggleQA}
          className={`w-full py-3 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2 ${
            qaActive
              ? 'bg-amber-600 hover:bg-amber-700 text-white'
              : 'bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700'
          }`}
        >
          <MessageCircle className="w-4 h-4" />
          {qaActive ? 'Q&A Mode Active — Listening...' : 'Activate Q&A Mode'}
        </button>

        {/* Navigation */}
        <div className="flex gap-3">
          <button
            onClick={() => handleNav('prev')}
            disabled={currentIndex <= 0}
            className={`flex-[2] py-5 rounded-xl text-lg font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-30 ${
              navFlash === 'prev' ? 'bg-blue-500' : 'bg-gray-800 hover:bg-gray-700 border border-gray-700'
            }`}
          >
            <ChevronLeft className="w-6 h-6" /> PREV
          </button>
          <button
            onClick={() => handleNav('next')}
            disabled={currentIndex >= totalSlides - 1}
            className={`flex-[3] py-5 rounded-xl text-lg font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-30 ${
              navFlash === 'next' ? 'bg-blue-500' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            NEXT <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
}

export function ControllerPage() {
  const [searchParams] = useSearchParams();
  const initialCode = searchParams.get('room') || '';
  const [roomCode, setRoomCode] = useState(initialCode);
  const [joined, setJoined] = useState(!!initialCode);

  const { isConnected, roomCode: activeRoom, remoteState, error, sendNavigate, sendToggleQA, sendDismissQA } =
    useControllerSocket({
      role: 'controller',
      roomCode: joined ? roomCode : undefined,
    });

  // If we have a room code from URL, auto-join
  useEffect(() => {
    if (initialCode) {
      setRoomCode(initialCode);
      setJoined(true);
    }
  }, [initialCode]);

  const handleJoin = (code: string) => {
    setRoomCode(code);
    setJoined(true);
  };

  if (!joined || !isConnected) {
    return <PairingScreen onJoin={handleJoin} error={error} />;
  }

  return (
    <RemoteControl
      remoteState={remoteState}
      isConnected={isConnected}
      roomCode={activeRoom}
      sendNavigate={sendNavigate}
      sendToggleQA={sendToggleQA}
      sendDismissQA={sendDismissQA}
    />
  );
}
