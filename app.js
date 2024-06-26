var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

const indexRouter = require("./routes/catalog.js")

var app = express();

const mongoose = require('mongoose');
mongoose.set('strictQuery', false);
const mongoDB = 'mongodb+srv://dreamsend08:5YBNl5X7AVNZ2SyM@cluster0.zxmpbqy.mongodb.net/inventory_app?retryWrites=true&w=majority&appName=Cluster0';

main().catch(err => console.log(err));
async function main() {
  await mongoose.connect(mongoDB);
  console.log('connected');
}

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static("public"));

app.use('/', indexRouter);

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
