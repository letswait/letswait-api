import express = require('express')
import passport = require('passport')
var pass = require('../../pass')

const api = express.Router()
const options = { session: true }

import SMS from '../../modules/sms'
import moment = require('moment');

api.post(
  '/auth',
  passport.authenticate('local', options),
  SMS.send
)
api.post('/code', pass.ensureTempAuth, SMS.receive)

api.get('/facebook-auth', passport.authenticate('facebook', options))
api.get('/facebook-auth/callback', passport.authenticate('facebook', { failureRedirect: '/' }),
  function(req, res) {
    if(!!req.user.registered) {
      res.redirect('/app')
    } else {
      res.json({
        gender: !!req.user.profile.gender,
        sexualPreference: !!req.user.searchSettings.sexualPreference,
        photos: req.user.profile.images.length > 0,
        food: req.user.profile.food > 0,
        name: !!req.user.name,
        birth: !!req.user.birth,
        goal: !!req.user.profile.goal,
      }).send()
    }
  }
)

/**
 * @todo restrict parameters sent down to user.
 */
import checkAuth from '../../modules/check-auth'
api.get('/check-auth', pass.ensureAuthenticated, checkAuth)
import refreshToken from '../../modules/refreshToken'
api.get('/check-auth/error', pass.ensureAuthenticated, refreshToken)

api.get('/logout', pass.ensureAuthenticated, (req, res) => {
  req.logout()
})

import postToken from '../../modules/user-post-sns-token'
api.get('/post-sns-token', pass.ensureAuthenticated, postToken)

export default api
