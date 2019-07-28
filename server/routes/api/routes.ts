import * as express from 'express'

const api = express.Router()

import * as pass from '../../pass'

import ping from '../../modules/ping'

api.get('/ping', ping)
api.get('/ping/auth', pass.auth, ping)
api.get('/ping/ensuredAuth', pass.ensureAuthenticated, ping)
// api.get('/ping/admin')

export default api