import { User } from '../schemas'
import sidewalk from 'library/sidewalk';

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
      process.env.NODE_ENV !== 'production' && sidewalk.error('Could not POST SNS token')
      res.status(500).send(e ? { accepted: false, message: e} : null)
    }
  })
}
