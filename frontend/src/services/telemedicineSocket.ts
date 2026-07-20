import { io, type Socket } from 'socket.io-client';
import { tokenStore } from './tokenStore';

// Same base as the REST API — in dev this goes through Vite's proxy, in
// prod it's the deployed API origin. Socket.IO needs an absolute-ish base
// (it can't share axios's relative baseURL), so fall back to same-origin.
const SOCKET_BASE_URL = import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_BASE_URL?.replace(/\/api\/?$/, '') || '/';

let socket: Socket | null = null;

/**
 * Lazily creates (or reuses) the /telemedicine namespace socket, authenticated
 * with the current access token. Call disconnectTelemedicineSocket() when
 * leaving a call so the connection doesn't linger.
 */
export function getTelemedicineSocket(): Socket {
  if (socket && socket.connected) return socket;

  socket = io(`${SOCKET_BASE_URL}/telemedicine`, {
    auth: { token: tokenStore.get() },
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 5,
  });

  return socket;
}

export function disconnectTelemedicineSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
