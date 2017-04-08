const express = require('express'),
      app = express(),
      server = require('http').Server(app),
      io = require('socket.io')(server),
      path = require('path'),
      port = process.env.PORT || 80;

server.listen(port, function () {
    console.log('Updated : Server listening at port %d', port);
});

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res) {
    res.render('index');
});

let usernames = {}, numUsers = 0;

io.on('connection', function (socket) {
    var addedUser = false;

    socket.on('new message', function (data) {
      socket.broadcast.emit('new message', {
        username: socket.username,
        message: data,
        timestamp: Date.now()
      });
    });

    socket.on('add user', function (username) {
      socket.username = username;
      usernames[username] = username;
      ++numUsers;
      addedUser = true;
      socket.emit('login', {
        numUsers: numUsers
      });

      socket.broadcast.emit('user joined', {
        username: socket.username,
        numUsers: numUsers
      });
    });

    socket.on('typing', function () {
      socket.broadcast.emit('typing', {
        username: socket.username
      });
    });

    socket.on('stop typing', function () {
      socket.broadcast.emit('stop typing', {
        username: socket.username
      });
    });

    socket.on('disconnect', function () {
      // remove the username from global usernames list
      if (addedUser) {
        delete usernames[socket.username];
        --numUsers;

        socket.broadcast.emit('user left', {
          username: socket.username,
          numUsers: numUsers
        });
      }
    });
});

 module.exports = app;
