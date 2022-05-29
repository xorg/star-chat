const express = require('express');
const path = require('path')
const http = require('http');
const { Server } = require("socket.io");
const namegen = require('unique-names-generator')
const jwt = require('jsonwebtoken');
const validator = require('validator');



const app = express();
const server = http.createServer(app);
const io = new Server(server);

const port = 4000

let users = {}

const mySecret = 'my-secret'


// define static route to serve static files such as css and client js
app.use('/', express.static(path.resolve(__dirname + '/static/')));

// define route to serve html file
app.get('/', (req, res) => {
  res.sendFile(path.resolve(__dirname + '/../src/index.html'));
});

// JWT auth using middleware
io.use((socket, next) => {
  const token = socket.handshake.auth.token;

  // verify jwt token and calls next(). If there's an error,
  // next(err) is called, which triggers the displaying of an error msg in the client
  jwt.verify(token, mySecret, next)
});


function sendWelcomeString(socketId, username) {
  /**
   * sendWelcomeString()
   * Send a lovely dynamic welcome message to a single socket
   * @param {String} socketId - Id of the receving socket
   * @param {String} username - Username of the receiving socket
   * @return {void}
   */
  const welcomeString = `Welcome StarChat, ${username}. May the force be with you!`
  io.to(socketId).emit("chatMessage", welcomeString)
}

function generateUsername() {
  /**
   * generateUsername()
   * Generate a username and make sure it doesn't exist already
   * @return {String} username
   */
  // generate random star wars username but make sure it's not taken by another socket
  let username = namegen.uniqueNamesGenerator({ dictionaries: [namegen.starWars] });
  while (username in Object.keys(users)) {
    username = namegen.uniqueNamesGenerator({ dictionaries: [namegen.starWars] });
  }
  return username
}

io.on('connection', (socket) => {
  const username = generateUsername()
  // send welcome string to user when he connects
  sendWelcomeString(socket.id, username);

  socket.broadcast.emit('chatMessage', `new user "${username}" connected`);

  // persist socket/username pair in in-memory "database" (the user object)
  users[username] = socket.id

  // send user list update to all users whenever a new socket connects
  io.emit("updateUserList", users)

  // handle public chat messages. Send them to everyone except the sender
  socket.on('chatMessage', (msg) => {
    msg = validator.escape(msg)
    socket.broadcast.emit('chatMessage', `${username}: ${msg}`);
  });

  socket.on('privateMessage', privateMessage => {
    // send private message to corresponding socket
    const socketId = users[privateMessage.receiver]
    socket.to(socketId).emit('privateMessage', `${username}: ${validator.escape(privateMessage.msg)}`);
  });


  socket.on('disconnect', () => {
    socket.broadcast.emit('chatMessage', `user "${username}" disconnected`);

    // update db with disconnecting socket
    delete users[username]

    // send user list update to all users whenever a socket leaves
    io.emit("updateUserList", users)

  });

  // Provide user list and username to client asynchronously and trigger callback on client
  // The callback feature is provided by socket.io 
  // Those messages are only sent from one client to the server and back. The other sockets don't get them
  socket.on("getAllUsers", (arg1, callback) => {
    callback(users);
  });

  socket.on("getUserName", (arg1, callback) => {
    callback(username);
  });


});




server.listen(port);

