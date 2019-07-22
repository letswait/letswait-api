'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
// Setup Express
const express = require("express");
const app = express();
// Setup HTTP Connections
const http = require("http");
const server = http.createServer(app);
const PORT = (process.env.PORT || 8080);
// Miscellaneous
const chalk_1 = require("chalk");
const config_1 = require("./config");
// import { socketRouter } from './routes/sockets/'
// Twilio Setup
const accountSid = config_1.default.twilioSID;
const authToken = config_1.default.twilioAuth;
const client = require('twilio')(accountSid, authToken);
// Setup Request Helpers
app.use(require('helmet')());
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});
app.use(express.static(path.join(__dirname, 'public')));
const cookieParser = require("cookie-parser");
app.use(cookieParser());
const bodyparser = require("body-parser");
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: true }));
// var session = require( 'express-session' )
// var mongoStore = require( 'connect-mongo' )(session)
// const sessionMiddleware = session({
//   secret: 'better dating for all',
//   resave: true,
//   saveUninitialized: true,
//   store: new mongoStore({
//     mongooseConnection: mongoose.connection
//   })
// })
const passport = require("passport");
const cookieSession = require("cookie-session");
const Keygrip = require("keygrip");
// app.use(sessionMiddleware)
app.use(cookieSession({
    name: 'session',
    keys: new Keygrip(['lastingConnecti0ns', 'quite ch4rming'], 'SHA384', 'base64'),
}));
app
    .use(passport.initialize())
    .use(passport.session())
    .listen(PORT, () => {
    console.log(chalk_1.default.green(`Starting Server on Port: ${PORT}`));
});
require("./pass");
// Setup Socket.io
const io = require('socket.io')(server)
    .use((socket, next) => {
    console.log('attempt being made to connect?');
    // cookieSession(socket.request, {} as any, next)
})
    .on('connection', (socket) => {
    const userId = socket.request.session.passport.user;
    console.log(`user: ${userId} has joined!`);
});
// Routes
const api_1 = require("./routes/api/");
app.use('/api/user', api_1.default.user);
app.use('/api/upload', api_1.default.upload);
app.use("/api/profile", api_1.default.profile);
app.use('/api/matches', api_1.default.match);
app.use('/api/dates', api_1.default.date);
app.use('/api/feed', api_1.default.feed);
app.use('/api', api_1.default.api);
/// app.use("/api/admin", api_routes.admin)
exports.default = app;
//# sourceMappingURL=app.js.map