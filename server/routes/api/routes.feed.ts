import * as express from 'express'
import * as passport from 'passport'
import * as pass from '../../pass'

const api = express.Router()

// import postChangeProfile from '../../modules/post-change-profile'
// api.post('/post-change-profile', pass.ensureAuthenticated, postChangeProfile)

import getFeed from '../../modules/get-feed'
api.get('/get-feed', pass.auth, getFeed)

export default api