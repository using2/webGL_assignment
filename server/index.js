const express = require('express');
const socketio = require('socket.io');
const http = require('http');

const cors = require('cors');
const router = require('./router');
const {addUser, removeUser, getUser, getUsersInRoom} = require('./user.js');

const PORT = process.env.PORT || 5000;

const app = express();
const server = http.createServer(app);
const io = socketio(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

io.on('connection', (socket) => {
  socket.on('join', ({name, room}, callback) => {
    const {error, user} = addUser({id: socket.id, name, room});

    if (error) callback({error: '에러가 발생했어요.'});

    socket.emit('message', {
      user: 'admin',
      text: `${user.name}, ${user.room}에 오신것을 환영합니다.`,
    });
    socket.broadcast.to(user.room).emit('message', {
      user: 'admin',
      text: `${user.name} 님이 가입하셨습니다.`,
    })

    socket.join(user.room);

    io.to(user.room).emit(
        'roomData', {room: user.room, users: getUsersInRoom(user.room)});

    callback();
  });

  socket.on('sendMessage', (message, callback) => {
    const user = getUser(socket.id);

    io.to(user.room).emit('message', {user: user.name, text: message});
    io.to(user.room).emit(
        'roomData', {room: user.room, users: getUsersInRoom(user.room)});

    callback();
  });

  socket.on('disconnect', () => {
    const user = removeUser(socket.id);

    if (user) {
      io.to(user.room).emit(
          'message',
          {user: 'Admin', text: `${user.name} 님이 방을 나갔습니다.`})
      io.to(user.room).emit('roomData', {
        room: user.room,
        users: getUsersInRoom(user.room),
      })
    }
    console.log('유저가 떠났어요.')
  })
});

app.use(cors());
app.use(router);

server.listen(PORT, () => console.log(`서버가 ${PORT} 에서 시작되었어요`));