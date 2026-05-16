import express from 'express';
import http from 'http';
import { Server as SocketServer } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDB } from './db';
import authRouter from './routes/auth';
import { pollRouter } from './routes/polls';
import { OAuth2Client } from 'google-auth-library';


dotenv.config();

const app = express();
const httpServer = http.createServer(app);

const io = new SocketServer(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
});

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json());

app.get('/health', (_, res) => res.json({ ok: true, time: new Date().toISOString() }));

app.use('/api/auth', authRouter);
app.use('/api/polls', pollRouter(io));

// Socket.io: join poll room for live updates
io.on('connection', (socket) => {
  socket.on('join_poll', (pollId: string) => {
    socket.join(`poll:${pollId}`);
  });
  socket.on('leave_poll', (pollId: string) => {
    socket.leave(`poll:${pollId}`);
  });
});

const PORT = process.env.PORT || 4000;

async function start() {
  try {
    await initDB();
    httpServer.listen(PORT, () => {
      console.log(` Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start:', err);
    process.exit(1);
  }
}

start();
