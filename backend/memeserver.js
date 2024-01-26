const { Server } = require("socket.io");

const io = new Server(3000, {
  wsEngine: eiows.Server
});