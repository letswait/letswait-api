import * as express from 'express'
import * as pass from '../../pass'

const api = express.Router()

import upload from '../../modules/upload'
api.post('/image/profile', pass.ensureAuthenticated, upload.profile)
api.post('/image/chat', pass.ensureAuthenticated, upload.chat)

export default api