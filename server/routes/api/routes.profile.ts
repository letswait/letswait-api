import * as express from 'express'
// import * as passport from 'passport'
import * as pass from '../../pass'

const api = express.Router()

import postChangeProfile from '../../modules/post-change-profile'
api.post('/post-change-profile', pass.ensureAuthenticated, postChangeProfile)

import postGeolocation from '../../modules/post-geolocation'
api.post('/post-geolocation', pass.auth, postGeolocation)

import postProfileEdit from '../../modules/post-profile-edit'
api.post('/edit-settings', pass.auth, postProfileEdit)

export default api