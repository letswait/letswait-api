import express = require('express')
import passport = require('passport')
var pass = require('../../pass')

import sidewalk from '../../library/sidewalk'

const api = express.Router()
const options = { session: true }

import SMS from '../../modules/sms'
import moment = require('moment');

api.post(
  '/auth',
  passport.authenticate('local', options),
  SMS.send,
)
api.post('/code', pass.auth, SMS.receive)

api.get('/facebook-auth', (req, res) => {
  passport.authenticate(
    'facebook',
    {
      ...options,
      state: req.query.uuid
    },
  )(req, res)
})
api.get('/facebook-auth/callback', passport.authenticate('facebook', { failureRedirect: '/' }), 
  function(req, res) {
    const {
      birth,
      name,
      profile,
      searchSettings,
      registered,
    } = req.user
  const isRegistered = !!registered
  delete req.user.registered
  if(isRegistered) {
    // sidewalk.warning(`User Registered: Sending to app`)
    res.redirect(`letswaitdating://app?user=${JSON.stringify(req.user)}`)
    // res.status(200).send({ accepted: true, user: req.user })
  } else {
    // sidewalk.warning(`User not registered, Sending Setup Routes`)
    const remainingSetupRoutes = [
      ...(birth ? [] : ['/setup/birthdate']),
      ...(name ? [] : ['/setup/name']),
      ...(profile && profile.gender ? [] : ['/setup/gender']),
      ...(searchSettings && searchSettings.sexualPreference ? [] : ['/setup/sexual-preference']),
      ...(profile && profile.images.length ? [] : ['/setup/photo-upload']),
      ...(profile && profile.food.length ? [] : ['/setup/food-interests']),
      ...(profile && profile.goal ? [] : ['/setup/goals']),
    ]
    res.redirect(`letswaitdating://app?routes=${JSON.stringify(remainingSetupRoutes)}`)
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

api.get('/logout', pass.auth, (req, res) => {
  req.logout()
  res.redirect('/')
})

import postToken from '../../modules/user-post-sns-token'
api.get('/post-sns-token', pass.auth, postToken)

export default api
