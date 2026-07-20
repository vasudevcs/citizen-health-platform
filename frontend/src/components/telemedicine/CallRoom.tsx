import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Mic, MicOff, Video, VideoOff, PhoneOff, Send, MessageSquare, Loader2, AlertTriangle } from 'lucide-react';
import { useTelemedicineSession } from '../../hooks/useTelemedicineSession';
import { useAuth } from '../../hooks/useAuth';

function VideoTile({ stream, muted, label }: { stream: MediaStream | null; muted: boolean; label: string }) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (ref.current) ref.current.srcObject = stream;
  }, [stream]);

  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden bg-slate-900">
      {stream ? (
        <video ref={ref} autoPlay playsInline muted={muted} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-slate-500 text-sm">
          Waiting for video…
        </div>
      )}
      <span className="absolute bottom-2 left-2 rounded-md bg-black/50 px-2 py-0.5 text-[11px] text-white">{label}</span>
    </div>
  );
}

const STATUS_LABEL: Record<string, string> = {
  idle: 'Preparing…',
  connecting: 'Requesting camera & microphone…',
  'waiting-for-peer': 'Waiting for the other participant to join…',
  connected: 'Connected',
  failed: 'Connection issue',
};

export default function CallRoom({ appointmentId, onLeave }: { appointmentId: string; onLeave: () => void }) {
  const { user } = useAuth();
  const {
    localStream,
    remoteStream,
    messages,
    status,
    micOn,
    cameraOn,
    mediaError,
    sendMessage,
    toggleMic,
    toggleCamera,
  } = useTelemedicineSession(appointmentId);

  const [chatOpen, setChatOpen] = useState(true);
  const [draft, setDraft] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!draft.trim()) return;
    sendMessage(draft);
    setDraft('');
  };

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-950 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900/60 text-white">
        <div className="flex items-center gap-2 text-xs">
          {status !== 'connected' && <Loader2 size={13} className="animate-spin" />}
          <span className={status === 'failed' ? 'text-red-400' : 'text-slate-300'}>{STATUS_LABEL[status]}</span>
        </div>
        <button
          onClick={() => setChatOpen((s) => !s)}
          className="inline-flex items-center gap-1.5 text-xs text-slate-300 hover:text-white"
        >
          <MessageSquare size={14} /> Chat
        </button>
      </div>

      {mediaError && (
        <div className="mx-4 mt-3 flex items-start gap-2 rounded-lg border border-red-800 bg-red-950/50 p-2.5 text-xs text-red-300">
          <AlertTriangle size={14} className="mt-0.5 flex-shrink-0" />
          {mediaError}
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-3 p-4">
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3 h-[420px]">
          <VideoTile stream={remoteStream} muted={false} label="Doctor" />
          <VideoTile stream={localStream} muted label={user ? `You (${user.name})` : 'You'} />
        </div>

        {chatOpen && (
          <motion.div
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-full lg:w-72 flex flex-col rounded-xl bg-slate-900 h-[420px]"
          >
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {messages.length === 0 ? (
                <p className="text-xs text-slate-500 text-center mt-6">No messages yet. Say hello!</p>
              ) : (
                messages.map((m, i) => {
                  const mine = m.sender === user?.id;
                  return (
                    <div key={i} className={`flex flex-col ${mine ? 'items-end' : 'items-start'}`}>
                      <div
                        className={`max-w-[85%] rounded-lg px-2.5 py-1.5 text-xs ${
                          mine ? 'bg-teal-600 text-white' : 'bg-slate-700 text-slate-100'
                        }`}
                      >
                        {m.text}
                      </div>
                      <span className="mt-0.5 text-[10px] text-slate-500">
                        {new Date(m.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  );
                })
              )}
              <div ref={chatEndRef} />
            </div>
            <div className="flex items-center gap-2 border-t border-slate-800 p-2">
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Type a message…"
                className="flex-1 rounded-lg bg-slate-800 px-2.5 py-1.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
              />
              <button onClick={handleSend} className="rounded-lg bg-teal-600 p-1.5 text-white hover:bg-teal-700">
                <Send size={14} />
              </button>
            </div>
          </motion.div>
        )}
      </div>

      <div className="flex items-center justify-center gap-3 pb-5">
        <button
          onClick={toggleMic}
          className={`rounded-full p-3 ${micOn ? 'bg-slate-700 hover:bg-slate-600' : 'bg-red-600 hover:bg-red-700'} text-white transition-colors`}
          title={micOn ? 'Mute microphone' : 'Unmute microphone'}
        >
          {micOn ? <Mic size={18} /> : <MicOff size={18} />}
        </button>
        <button
          onClick={toggleCamera}
          className={`rounded-full p-3 ${cameraOn ? 'bg-slate-700 hover:bg-slate-600' : 'bg-red-600 hover:bg-red-700'} text-white transition-colors`}
          title={cameraOn ? 'Turn camera off' : 'Turn camera on'}
        >
          {cameraOn ? <Video size={18} /> : <VideoOff size={18} />}
        </button>
        <button
          onClick={onLeave}
          className="rounded-full bg-red-600 p-3 text-white hover:bg-red-700 transition-colors"
          title="Leave call"
        >
          <PhoneOff size={18} />
        </button>
      </div>
    </div>
  );
}
