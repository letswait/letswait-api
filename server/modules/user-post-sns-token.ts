import { User } from '../schemas'

export default function(req, res) {
  User.findById(req.user._id, (err, user) => {
    try {
      if(err || !user) throw 'couldn\'t find user'
      const { token, os } = req.query
      if(!token || !os) throw 'insufficient data'
      const device = user.devices.get(req.headers.uuid)
      if(!device) throw 'device not found, something went wrong'
      user.devices.set(req.headers.uuid, {
        ...device,
        token,
        os,
      })
      User.updateOne(user, (err, savedUserData) => {
        if(err) throw 'couldn\'t save sns token'
        res.status(200).send({ accepted: true })
      })
    } catch(e) {
      console.log('Error POSTing SNS Token: ', e || 'nothing to log')
      res.status(500).send(e ? { accepted: false, message: e} : null)
    }
  })
}
