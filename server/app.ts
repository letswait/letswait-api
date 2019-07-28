'use strict'
import path = require('path')

// Setup Express
import express = require('express')
const app = express()
// var session = require('express-session')
import mongoose = require('mongoose');

import fs = require('fs')

app.use(function(req, res, next) {
  // if (!req.secure && process.env.NODE_ENV !== 'production') {
  //   console.log(chalk.magenta('Redirecting unsecured client to HTTPS'))
  //   res.redirect(301, 'https://' + req.hostname + ':port' + req.originalUrl);
  // } else {
    console.log(chalk.greenBright('Established Secure Connection with Client'))
    return next();
  // }
});
// import https = require('https') 
// import http = require('http') 
// https.createServer(httpsOptions, app).listen(443, () => {
//   console.log(chalk.yellow('Initializing SSL...'))
// })
// http.createServer(app).listen(80, () => {
//   console.log(chalk.yellow('Initializing TLS...'))
// })

// const https = require('https')
// const pem = require('pem')
// const express = require('express')
// const app = express()

// let server

// pem.createCertificate({ days: 1, selfSigned: true }, function (err, keys) {
//   if (err) {
//     throw err
//   }

//   app.get('/', function (req, res) {
//     res.send('o hai!')
//   })

//   server = https.createServer({ key: keys.serviceKey, cert: keys.certificate }, app).listen(443)
// })


// Miscellaneous
import chalk from 'chalk'
import CONFIG from './config'
// import { socketRouter } from './routes/sockets/'

// Twilio Setup
const accountSid = CONFIG.twilioSID
const authToken = CONFIG.twilioAuth
const client = require('twilio')(accountSid, authToken)

// Setup Request Helpers
app.use(require('helmet')())
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
  next()
})

app.use(express.static(path.join(__dirname, 'public')))

import cookieParser = require('cookie-parser')
app.use(cookieParser())
import * as bodyparser from 'body-parser'
app.use(bodyparser.json())
app.use(bodyparser.urlencoded({ extended: true }))

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

import passport = require('passport')
import cookieSession = require('cookie-session')
import Keygrip = require('keygrip');
// app.use(sessionMiddleware)
app.use(cookieSession({
  name: 'session',
  keys: new Keygrip(['lastingConnecti0ns','quite ch4rming'], 'SHA384', 'base64'),
}))
app
  .use(passport.initialize())
  .use(passport.session())

// app.listen(PORT, () => {
//   console.log(chalk.green(`Starting Server on Port: ${PORT}`))
// })

import './pass'

// Setup Socket.io
// const io = require('socket.io')(server)
//   .use((socket, next) => {
//     console.log('attempt being made to connect?')
//     // cookieSession(socket.request, {} as any, next)
//   })
//   .on('connection', (socket) => {
//     const userId = socket.request.session.passport.user
//     console.log(`user: ${userId} has joined!`)
//   })

const PORT = (process.env.PORT || 8080)
// Setup HTTP Connections
import httpolyglot = require('httpolyglot')
if(process.env.NODE_ENV !== 'production') {
  const httpsOptions: ServerOptions = {
    // key: fs.readFileSync(`${__dirname}/security/server.key`, 'utf-8'),
    key: fs.readFileSync(`${__dirname}/certificates/server_dev.key`, 'utf-8'),
    // cert: fs.readFileSync(`${__dirname}/security/server.cert`, 'utf-8'),
    cert: fs.readFileSync(`${__dirname}/certificates/server_dev.crt`, 'utf-8'),
    // requestCert: false,
    // rejectUnauthorized: false,
  }
  httpolyglot.createServer(httpsOptions, app).listen(PORT, () => {
    console.log(chalk.yellow('Initializing HTTPS Server...'))
  })
} else {
  app.listen(PORT, () => {
    console.log(chalk.yellow('Initializing Production HTTPS Server...'))
  })
}

// Routes
import api_routes from './routes/api/'
import { ServerOptions } from 'https';
app.use('/api/user', api_routes.user)
app.use('/api/upload', api_routes.upload)
app.use("/api/profile", api_routes.profile)
app.use('/api/matches', api_routes.match)
app.use('/api/dates', api_routes.date)
app.use('/api/feed', api_routes.feed)
app.use('/api', api_routes.api)
/// app.use("/api/admin", api_routes.admin)

// server.listen(PORT, () => {
//   console.log(chalk.yellow('Initializing SSL...'))
// })

export default app
