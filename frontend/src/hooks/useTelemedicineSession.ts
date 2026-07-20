import { useCallback, useEffect, useRef, useState } from 'react';
import type { Socket } from 'socket.io-client';
import { getTelemedicineSocket, disconnectTelemedicineSocket } from '../services/telemedicineSocket';
import { citizenApi } from '../services/citizenService';
import type { AppointmentChatMessage } from '../types/health';

export type CallConnectionStatus = 'idle' | 'connecting' | 'waiting-for-peer' | 'connected' | 'failed';

type SignalPayload =
  | { type: 'offer'; sdp: RTCSessionDescriptionInit }
  | { type: 'answer'; sdp: RTCSessionDescriptionInit }
  | { type: 'ice'; candidate: RTCIceCandidateInit };

const ICE_SERVERS: RTCConfiguration = {
  iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
};

/**
 * Drives a single telemedicine call: captures local media, negotiates a
 * WebRTC peer connection over the /telemedicine socket namespace, and
 * exposes chat send/receive for the same room.
 *
 * Negotiation rule to avoid glare: whichever side is *already* in the room
 * when the other joins is the one that creates the offer (triggered by the
 * `peer-joined` event), the newcomer only ever answers.
 */
export function useTelemedicineSession(appointmentId: string | null) {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [messages, setMessages] = useState<AppointmentChatMessage[]>([]);
  const [status, setStatus] = useState<CallConnectionStatus>('idle');
  const [micOn, setMicOn] = useState(true);
  const [cameraOn, setCameraOn] = useState(true);
  const [mediaError, setMediaError] = useState<string | null>(null);

  const pcRef = useRef<RTCPeerConnection | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (!appointmentId) return;

    const validAppointmentId = appointmentId;

    let cancelled = false;
    setStatus('connecting');
    setMediaError(null);

    async function setup() {
      const socket = getTelemedicineSocket();
      socketRef.current = socket;

      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      } catch {
        if (!cancelled) setMediaError('Camera/microphone access is required to join the call.');
        setStatus('failed');
        return;
      }
      if (cancelled) {
        stream.getTracks().forEach((t) => t.stop());
        return;
      }
      localStreamRef.current = stream;
      setLocalStream(stream);

      const pc = new RTCPeerConnection(ICE_SERVERS);
      pcRef.current = pc;
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      pc.ontrack = (e) => setRemoteStream(e.streams[0]);
      pc.onicecandidate = (e) => {
        if (e.candidate) {
          socket.emit('webrtc-signal', { validAppointmentId, signal: { type: 'ice', candidate: e.candidate.toJSON() } });
        }
      };
      pc.onconnectionstatechange = () => {
        if (cancelled) return;
        if (pc.connectionState === 'connected') setStatus('connected');
        else if (pc.connectionState === 'failed' || pc.connectionState === 'disconnected') setStatus('failed');
      };

      socket.emit('join-room', { validAppointmentId }, (res: { success: boolean; message?: string }) => {
        if (cancelled) return;
        if (!res?.success) {
          setStatus('failed');
          setMediaError(res?.message || 'Could not join the call room.');
        } else {
          setStatus('waiting-for-peer');
        }
      });

      socket.on('peer-joined', async () => {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socket.emit('webrtc-signal', { appointmentId, signal: { type: 'offer', sdp: offer } });
      });

      socket.on('webrtc-signal', async ({ signal }: { signal: SignalPayload }) => {
        if (signal.type === 'offer') {
          await pc.setRemoteDescription(new RTCSessionDescription(signal.sdp));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          socket.emit('webrtc-signal', { appointmentId, signal: { type: 'answer', sdp: answer } });
        } else if (signal.type === 'answer') {
          await pc.setRemoteDescription(new RTCSessionDescription(signal.sdp));
        } else if (signal.type === 'ice') {
          try {
            await pc.addIceCandidate(new RTCIceCandidate(signal.candidate));
          } catch {
            // benign if it arrives before remote description is set in rare races
          }
        }
      });

      socket.on('chat-message', (msg: AppointmentChatMessage) => {
        setMessages((prev) => [...prev, msg]);
      });

      socket.on('peer-left', () => {
        setRemoteStream(null);
        setStatus('waiting-for-peer');
      });

      try {
        const history = await citizenApi.getAppointmentChat(validAppointmentId);
        if (!cancelled) setMessages(history);
      } catch {
        // non-fatal — call still works without history
      }
    }

    setup();

    return () => {
      cancelled = true;
      const socket = socketRef.current;
      if (socket) {
        socket.emit('leave-room');
        socket.off('peer-joined');
        socket.off('webrtc-signal');
        socket.off('chat-message');
        socket.off('peer-left');
      }
      pcRef.current?.close();
      pcRef.current = null;
      localStreamRef.current?.getTracks().forEach((t) => t.stop());
      localStreamRef.current = null;
      disconnectTelemedicineSocket();
      setLocalStream(null);
      setRemoteStream(null);
    };
  }, [appointmentId]);

  const sendMessage = useCallback(
    (text: string) => {
      if (!appointmentId || !text.trim()) return;
      socketRef.current?.emit('chat-message', { appointmentId, text: text.trim() });
    },
    [appointmentId]
  );

  const toggleMic = useCallback(() => {
    const stream = localStreamRef.current;
    if (!stream) return;
    stream.getAudioTracks().forEach((t) => (t.enabled = !t.enabled));
    setMicOn((prev) => !prev);
  }, []);

  const toggleCamera = useCallback(() => {
    const stream = localStreamRef.current;
    if (!stream) return;
    stream.getVideoTracks().forEach((t) => (t.enabled = !t.enabled));
    setCameraOn((prev) => !prev);
  }, []);

  return { localStream, remoteStream, messages, status, micOn, cameraOn, mediaError, sendMessage, toggleMic, toggleCamera };
}
