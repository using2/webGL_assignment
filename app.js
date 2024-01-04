/* 설치한 express 모듈 불러오기 */
const express = require('express');

/* 설치한 socket.io 모듈 불러오기 */
const socket = require('socket.io');

/* Node.js 기본 내장 모듈 불러오기 */
const http = require('http');

/* Node.js 기본 내장 모듈 불러오기 */
const fs = require('fs');

/* express 객체 생성 */
const app = express();

/* express http 서버 생성 */
const server = http.createServer(app);

/* 생성된 서버를 socket.io에 바인딩 */
const io = socket(server);

const formatMessage = require('./utils/messages');
const formatChar = require('./utils/messages');
const {userJoin, getCurrentUser, userLeave, getRoomUsers} =
    require('./utils/users');

app.use('/css', express.static('./static/css'));
app.use('/js', express.static('./static/js'));
app.use('/models', express.static('./static/js/models'));
app.use('/build', express.static('./node_modules/three/build'));
app.use('/jsm', express.static('./node_modules/three/examples/jsm'));

const Announcement = '공지';

/* Get 방식으로 / 경로에 접속하면 실행 됨 */
app.get('/', function(request, response) {
  fs.readFile('./static/index.html', function(err, data) {
    if (err) {
      response.send('에러')
    } else {
      response.writeHead(200, {'Content-Type': 'text/html'})
      response.write(data)
      response.end()
    }
  })
})

app.get('/chat.html', function(request, response) {
  const username = request.query.username;
  const room = request.query.room;

  fs.readFile('./static/chat.html', function(err, data) {
    if (err) {
      response.send('에러');
    } else {
      const updatedData = data.toString()
                              .replace('{{username}}', username)
                              .replace('{{room}}', room);

      response.writeHead(200, {'Content-Type': 'text/html'});
      response.write(updatedData);
      response.end();
    }
  });
});


io.on('connection', socket => {
  socket.on('joinRoom', ({username, room}) => {
    const user = userJoin(socket.id, username, room, 0, 1, 30);
    socket.join(user.room);

    socket.to(user.room).emit(
        'message',
        formatMessage(Announcement, `${user.username}님이 입장하셨습니다.`));

    socket.emit(
      'oldCharacter',
      getRoomUsers(user.room));

    socket.to(user.room).emit(
      'newCharacter',
      formatChar(user.username, 0, 1, 30));

    io.to(user.room).emit(
        'roomUsers', {room: user.room, users: getRoomUsers(user.room)});
  });

  socket.on('chatMessage', (msg) => {
    const user = getCurrentUser(socket.id);
    io.to(user.room).emit('message', formatMessage(user.username, msg));
  });

  socket.on('myPosition', (position) => {
    const user = getCurrentUser(socket.id);
    io.to(user.room).emit('otherPosition', formatChar(position.username, position.x, position.y, position.z));
  });

  socket.on('disconnect', () => {
    const user = userLeave(socket.id);
    if (user) {
      io.to(user.room).emit(
          'message',
          formatMessage(Announcement, `${user.username}님이 퇴장하셨습니다.`));
    }
  });
});

/* 서버를 8080 포트로 listen */
server.listen(8080, function() {
  console.log('서버 실행 중..')
})