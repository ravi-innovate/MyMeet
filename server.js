const express = require('express');
const http = require('http');
const app = express();
const server = http.createServer(app);
const { v4: uuidv4 } = require('uuid');
const { ExpressPeerServer } = require('peer');
const io = require('socket.io')(server); // Import and initialize socket.io

// Initialize Peer server
const peerServer = ExpressPeerServer(server, {
  debug: true,
});

// Set up middleware
app.use(express.static('public'));
app.use('/peerjs', peerServer);

// Set the view engine to EJS
app.set('view engine', 'ejs');

// Route to generate a unique room ID and redirect
app.get('/', (req, res) => {
  res.redirect(`/${uuidv4()}`);
});

// Route to render the room template with the room ID
app.get('/:room', (req, res) => {
  res.render('room', { roomId: req.params.room });
});

// Socket.io connection handling
io.on('connection', socket => {
  socket.on('join-room', (roomId, userId) => {
    socket.join(roomId);
    socket.to(roomId).broadcast.emit('user-connected', userId);
  });
});

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
