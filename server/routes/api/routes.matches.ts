import * as express from 'express'
import passport = require('passport')
var pass = require('../../pass')

const api = express.Router()

import getMatches from '../../modules/get-matches'
api.get('/get-matches', pass.auth, getMatches)

import postMatch from '../../modules/post-match'
api.post('/post-match', pass.auth, postMatch)

import postWheel from '../../modules/post-wheel'
api.post('/post-wheel', pass.auth, postWheel)


export default api