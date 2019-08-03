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
      registered,
      birth,
      name,
      profile,
      searchSettings,
    } = req.user
    console.log('Got User: ', name, birth, registered)
    console.log('Showing Session: ', req.session)
    sidewalk.success('Facebook Passport Login')
    if(registered) {
      sidewalk.success(`User Registered: Sending to app...`)
      res.status(200).send({ accepted: true, user: req.user })
    } else {
      sidewalk.detour(`User not registered, Sending Setup Routes...`)

      res.redirect(307, `letswaitdating://app?routes=${JSON.stringify([
        ...(birth ? [] : ['/setup/birthdate']),
        ...(name ? [] : ['/setup/name']),
        ...(profile && profile.gender ? [] : ['/setup/gender']),
        ...(searchSettings && searchSettings.sexualPreference ? [] : ['/setup/sexual-preference']),
        ...(profile && profile.images.length ? [] : ['/setup/photo-upload']),
        ...(profile && profile.food.length ? [] : ['/setup/food-interests']),
        ...(profile && profile.goal ? [] : ['/setup/goals']),
      ])}`)
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
api.get('/post-sns-token', pass.ensureAuthenticated, postToken)

export default api
