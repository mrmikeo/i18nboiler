const http 				= require('http');
const https 			= require('https');
const createError 		= require('http-errors');
const express 			= require('express');
const path 				= require('path');
const cookieParser 		= require('cookie-parser');
const logger 			= require('morgan');
const request 			= require('request');
const Session 			= require('express-session')
const flash 			= require('connect-flash');
const csrf 				= require('csurf')
const fs 				= require('fs');
const ini 				= require('ini');
const sharedsession		= require('socket.io-express-session');
const redis 			= require('redis');
const lodash			= require('lodash');
const i18n 				= require('i18n-2')
const crypto 			= require('crypto')

var ini_config = ini.parse(fs.readFileSync('./config.ini', 'utf-8'));

const redisStore 		= require('connect-redis')(Session);

const { createClient } = require("redis")
let redisClient = createClient({ legacyMode: true })
redisClient.connect().catch(console.error)

var session = Session({
  secret: 'secretsessionvar',
  name: '_pwaboiler',
  resave: true,
  saveUninitialized: true,
  cookie: { secure: false }, // Note that the cookie-parser module is no longer needed
  store: new redisStore({ client: redisClient }),
});

var indexRouter = require('./routes/index');

var serverPort = 8181; //ini_config.server_port;

var app = express();
var server = http.createServer(app);

i18n.expressBind(app, {
    // setup some locales - other locales default to en silently
    locales: ['en', 'de'],
});

app.set('trust proxy', 1);
app.use(session);

var io = require('socket.io')(server);
io.use(sharedsession(session, { autoSave:true }));

server.listen(serverPort);

////
// Web Stuff

app.use(function(req, res, next) {
    req.i18n.setLocaleFromSessionVar();
    next();
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'twig');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(csrf());
app.use(flash());
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


////
// Socket IO Stuff

io.on('connection', function (socket) {
	
	var sessionId = socket.handshake.session.id;
	
	
	if (socket.handshake.session.user && socket.handshake.session.user.id != '')
	{
		// Logged In User
	

	}
	else
	{

		// Not logged
		
	}
		

    

    socket.on('something', function(input) {
    
    	socket.emit('something');
    
    });
    

	

    
});




////
// These functions are used for storing sensitive information in the DB

function encrypt(text) {
  var cipher = crypto.createCipheriv('aes-256-gcm', ini_config.crypt_pass, ini_config.crypt_iv)
  var encrypted = cipher.update(text, 'utf8', 'hex')
  encrypted += cipher.final('hex');
  var tag = cipher.getAuthTag();
  return {
    content: encrypted,
    tag: tag
  };
}

function decrypt(encrypted) {
  var decipher = crypto.createDecipheriv('aes-256-gcm', ini_config.crypt_pass, ini_config.crypt_iv)
  decipher.setAuthTag(encrypted.tag);
  var dec = decipher.update(encrypted.content, 'hex', 'utf8')
  dec += decipher.final('utf8');
  return dec;
}
