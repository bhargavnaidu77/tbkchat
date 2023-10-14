const http = require('http');
const { Server } = require('socket.io');
const { v4: uuid } = require("uuid");

const httpServer = http.createServer();
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

io.use((socket, next) => {
  const username = socket.handshake.auth.username;
  if (!username) {
    return next(new Error('Invalid username'));
  }
  socket.username = username;
  socket.userId = uuid(); 
  next();
});

io.on('connection', async (socket) => {
  console.log('A user connected',socket.username);
  const users=[];
  for (let [id,socket] of io.of("/").sockets){
    users.push({
      userId:socket.userId,
      username:socket.username,
    });
  }
  //all users 
  socket.emit("users",users)

  socket.emit('session', { userId: socket.userId, username: socket.username });
//new user
socket.broadcast.emit("user connected",{
  userId:socket.userId,
  username:socket.username,
});

//new message
socket.on("new message",(message)=>{
  socket.broadcast.emit("new message",{
    userId:socket.userId,
    username:socket.username,
    message,
  });
})

});

httpServer.listen(process.env.PORT || 4000, () => {
  console.log('Server is running on http://localhost:4000');
});
