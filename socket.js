const socketIO = require('socket.io');

function ioEvents(io) {
  io.sockets.on('connection', socket => {
    // join perticular chat room
    socket.on('join', data => {
      socket.join(data.conversation_id);
      socket.broadcast.emit('joined', data);
    });

    // when someone disconnected
    socket.on('disconnect', () => {
      console.log('user disconnected');
    });

    // when someone someone is typing
    socket.on('typing', data => {
      socket.broadcast
        .to(data.roomId)
        .emit('notifyTyping', { user: data.user, message: data.message });
    });

    // when soemone stops typing
    socket.on('stopTyping', () => {
      socket.broadcast.emit('notifyStopTyping');
    });

    socket.on('chat-message', async data => {
      console.log('data', data);
      // broadcast message to joined roomId(conversation ID).
      socket.broadcast.to(data.conversation_id).emit('received', data);
    });
  });
}

function socketInit(app) {
  const io = socketIO.listen(app);

  // define all events
  ioEvents(io);
}

module.exports = socketInit;
