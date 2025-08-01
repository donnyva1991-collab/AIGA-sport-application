const socketio = require('socket.io');
const jwt = require('jsonwebtoken');
const { send } = require('#facades/chat');
const { accessToken } = require('#configs/jwt');
const user = jwt.verify(token, accessToken.secret);
let io;

function initSocket(server) {
  io = socketio(server, {
  cors: { origin: process.env.ALLOWED_ORIGINS || 'http://localhost:3000' }
});

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('Unauthorized'));

    try {
      const user = jwt.verify(token, JWT_SECRET);
      socket.user = user;
      next();
    } catch (err) {
      return next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User ${socket.user.id} connected`);

    socket.on('message', async ({ toUserId, text }) => {
      const fromUserId = socket.user.id;
      const message = await send({ fromUserId, toUserId, text });

      // Отправить сообщение себе и получателю (если в сети)
      socket.emit('message', message);
      socket.broadcast.emit('message', message); // с комнатами
      socket.to(`user-${toUserId}`).emit('message', message);
    });

    socket.on('disconnect', () => {
      console.log(`User ${socket.user.id} disconnected`);
    });
  });
}

socket.on('joinRoom', (room) => {
  socket.join(room);
});

socket.on('groupMessage', async ({ room, text }) => {
  const fromUserId = socket.user.id;

  const message = await Message.create({
    fromUserId,
    text,
    room, // ← это групповой чат
    toUserId: null,
  });

  // Отправка сообщения всем в комнате(мне тоже)
  io.to(room).emit('groupMessage', message);
});
