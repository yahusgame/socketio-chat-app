const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const crypto = require('crypto'); // Rastgele renk üretmek için

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const users = {}; // Kullanıcı bilgilerini saklamak için

function generateRandomColor() {
  return '#' + crypto.randomBytes(3).toString('hex');
}

// Anasayfa için route (index.html)
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// /chat yolu için yeni bir route ekleyelim
app.get('/chat', (req, res) => {
  res.sendFile(__dirname + '/chat.html');  // chat.html dosyasını eklemeniz gerekir
});

// Socket.io ile bağlantı
io.on('connection', (socket) => {
  console.log('Bir kullanıcı bağlandı: ' + socket.id);

  // Yeni bağlanan kullanıcı için rastgele bir renk ata
  users[socket.id] = { color: generateRandomColor() };

  socket.on('set username', (username) => {
    users[socket.id].username = username;
    // Bağlantı sağlandığında kullanıcı adını ve rengini istemciye gönder
    socket.emit('user info', { username: users[socket.id].username, color: users[socket.id].color });
  });

  socket.on('chat message', (msg) => {
    // Mesajı gönderen kullanıcının rengini de mesajla birlikte gönder
    io.emit('chat message', {
      message: msg,
      username: users[socket.id].username,
      color: users[socket.id].color,
    });
  });

  socket.on('disconnect', () => {
    console.log('Bir kullanıcı ayrıldı: ' + socket.id);
    delete users[socket.id]; // Kullanıcı ayrıldığında bilgilerini sil
  });
});

server.listen(3001, () => {
  console.log('3001 portunda dinleniyor');
});
      
