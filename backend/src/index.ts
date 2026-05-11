import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { PrismaClient } from '@prisma/client';

dotenv.config();

import authRouter from './routes/auth';
import employeeRouter from './routes/employee';
import trackingRouter from './routes/tracking';
import chatRouter from './routes/chat';

const app = express();
const port = process.env.PORT || 5000;
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRouter);
app.use('/api/employees', employeeRouter);
app.use('/api/tracking', trackingRouter);
app.use('/api/chat', chatRouter);

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
  },
});

app.set('socketio', io);

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);
  
  // Register socket to a private room
  socket.on('register', (data) => {
    if (data.employeeId) {
      socket.join(`user_${data.employeeId}`);
      console.log(`Socket ${socket.id} joined room user_${data.employeeId}`);
    }
  });

  socket.on('updateLocation', (data) => {
    socket.broadcast.emit('employeeLocationUpdate', data);
  });

  socket.on('privateMessage', async (data) => {
    const { senderId, receiverId, content } = data;
    try {
      // Save to database
      const msg = await prisma.message.create({
        data: {
          senderId,
          receiverId,
          content
        }
      });
      // Emit to receiver
      console.log(`Sending message from ${senderId} to user_${receiverId}`);
      io.to(`user_${receiverId}`).emit('newMessage', msg);
      // Emit back to sender so they know it sent successfully
      socket.emit('messageSent', msg);
    } catch (err) {
      console.error('Error saving message:', err);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Backend is running' });
});

httpServer.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
