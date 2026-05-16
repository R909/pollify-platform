import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:4000', {
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
