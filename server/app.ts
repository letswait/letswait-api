'use strict'
import path = require('path')
import fs = require('fs')
import sidewalk from '@library/sidewalk'

// Setup Express
import express = require('express')
const app = express()

app.use(function(req, res, next) {
  if (!req.secure && process.env.NODE_ENV !== 'production') {
    sidewalk.detour('Redirecting Unsecure Connection to HTTP')
    res.redirect(301, 'https://' + req.hostname + ':port' + req.originalUrl);
  } else {
    sidewalk.success('Established Secure Connection with Client')
    return next();
  }
});

app.use(express.static(path.join(__dirname, 'public')))

import cookieParser = require('cookie-parser')
import * as bodyparser from 'body-parser'
// Setup Request Parsing
app.use(require('helmet')())
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
  next()
})
app.use(cookieParser())
app.use(bodyparser.json())
app.use(bodyparser.urlencoded({ extended: true }))

import passport = require('passport')
import cookieSession = require('cookie-session')
import Keygrip = require('keygrip');
// Setup Authentication
app.use(cookieSession({
  name: 'session',
  keys: new Keygrip(['lastingConnecti0ns','quite ch4rming'], 'SHA384', 'base64'),
}))
app
  .use(passport.initialize())
  .use(passport.session())

import './pass'

// const io = require('socket.io')(server)
// import { socketRouter } from './routes/sockets/'
// Setup Socket.io
//   .use((socket, next) => {
//     sidewalk.warning('Client connecting')
//     // cookieSession(socket.request, {} as any, next)
//   })
//   .on('connection', (socket) => {
//     const userId = socket.request.session.passport.user
//     sidewalk.success(`user: ${userId} has joined!`)
//   })

// Routes
import api_routes from './routes/api/'
app.use('/api/user', api_routes.user)
app.use('/api/upload', api_routes.upload)
app.use("/api/profile", api_routes.profile)
app.use('/api/matches', api_routes.match)
app.use('/api/dates', api_routes.date)
app.use('/api/feed', api_routes.feed)
app.use('/api', api_routes.api)
/// app.use("/api/admin", api_routes.admin)

import { ServerOptions } from 'https'
const PORT = (process.env.PORT || 8080)
// Setup HTTP Connections
import httpolyglot = require('httpolyglot')
if(process.env.NODE_ENV !== 'production') {
  const httpsOptions: ServerOptions = {
    key: fs.readFileSync(`${__dirname}/../security/server_dev.key`, 'utf-8'),
    cert: fs.readFileSync(`${__dirname}/../security/server_dev.crt`, 'utf-8'),
  }
  httpolyglot.createServer(httpsOptions, app).listen(PORT, () => {
    sidewalk.warning('Initializing HTTPS Server')
  })
  app.get('/localcert', (req, res) => {
    sidewalk.emphasize('A Client is downloading a CA Certificate', req.ip, req.headers.uuid)
    res.status(200).sendFile('/Users/saul/Projects/LetsWait/LetsWaitServer/letswaitapi/security/server_dev.crt')
  })
} else {
  app.listen(PORT, () => {
    sidewalk.warning('Initializing Production HTTPS Server...')
  })
}

export default app
