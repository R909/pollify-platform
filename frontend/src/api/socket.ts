import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

function resolveSocketUrl(): string {
  const explicitSocketUrl = import.meta.env.VITE_SOCKET_URL;
  if (explicitSocketUrl) return explicitSocketUrl;

  const apiUrl = import.meta.env.VITE_API_URL;
  if (apiUrl) {
    return apiUrl.replace(/\/api\/?$/, '');
  }

  return 'http://localhost:4000';
}

export function getSocket(): Socket {
  if (!socket) {
    socket = io(resolveSocketUrl(), {
      transports: ['websocket', 'polling'],
    });
  }
  return socket;
}

export function joinPoll(pollId: string) {
  getSocket().emit('join_poll', pollId);
}

export function leavePoll(pollId: string) {
  getSocket().emit('leave_poll', pollId);
}
