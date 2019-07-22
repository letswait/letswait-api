import * as express from 'express'

const api = express.Router()

import ping from '../../modules/ping'

api.get('/ping', ping)

export default api