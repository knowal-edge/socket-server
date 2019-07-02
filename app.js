var createError = require('http-errors');
var express = require('express');
var path = require('path');
const http = require("http");
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const socketIo = require("socket.io");
const axios = require("axios");


var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();
const server = http.createServer(app);
const io = socketIo(server); // < Interesting!
const getApiAndEmit = async socket => {
  try {
    const res = await axios.get(
      "https://dweet.io/get/latest/dweet/for/socketThingname"
    ); // Getting the data from Dweeti.io
    socket.emit("FromAPI", "70"); // Emitting a new message. It will be consumed by the client
    console.log("sddsds"+res.data.with[1].content.Temperature);
  } catch (error) {
    console.error(`Error: ${error.code}`);
  }
};

let interval;
io.on("connection", socket => {
  console.log("New client connected");
  if (interval) {
    clearInterval(interval);
  }
  interval = setInterval(() => getApiAndEmit(socket), 10000);
  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});
server.listen(4001, () => console.log(`Listening on port 4001`));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
