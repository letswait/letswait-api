import * as express from 'express'
import * as pass from '../../pass'

const api = express.Router()

import upload from '../../modules/upload'
api.post('/image/profile', pass.auth, upload.profile)
api.post('/image/chat', pass.auth, upload.chat)

export default api