var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const io = require("socket.io")(4001);
const axios = require("axios");
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

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

//Data requesting to simulation edge (Dweet.io) using axios lib and then emiting using socket
const getApiAndEmit = async socket => {
  try {
    const res = await axios.get(
      "https://dweet.io/get/latest/dweet/for/socketThingname"
    ); // Getting the data from Dweeti.io
    socket.emit("FromAPI", res.data.with[0].content.Temperature); // Emitting a new message. It will be consumed by the client
    console.log("sddsds"+res.data.with[0].content.Temperature);
  } catch (error) {
    console.error(`Error: ${error.code}`);
  }
};
//Socket connection and emit for every 10 seconds interval
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
