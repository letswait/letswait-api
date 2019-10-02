import { User } from '../schemas'
import sidewalk from '../library/sidewalk';

export default function(req, res) {
  // Find User with existing device UUID
  if(!req.body.token || !req.headers.os) {
    res.status(500).send({ accepted: false})
  } else {
    console.log('registering user for remote push notifications')
    User.findOneAndUpdate(
      {
        _id: req.user._id,
        'devices._id': req.headers.uuid,
      },
      {
        $set: {
          'devices.$.token': req.body.token,
          'devices.$.os': req.headers.os,
        },
      },
      {
        new: true,
      },
      (err, doc) => {
        if(err || !doc) {
          sidewalk.error('couldn\'t save sns token')
          res.status(500).send(err ? { accepted: false, message: err} : null)
        } else {
          res.status(200).send({ accepted: true })
        }
      }
    )
  }

  // User.findById(req.user._id, (err, user) => {
  //   try {
  //     if(err || !user) throw 'couldn\'t find user'
  //     const { token, os } = req.query
  //     if(!token || !os) throw 'insufficient data'
  //     const device = user.devices.get(req.headers.uuid)
  //     if(!device) throw 'device not found, something went wrong'
  //     user.devices.set(req.headers.uuid, {
  //       ...device,
  //       token,
  //       os,
  //     })
  //     User.updateOne(user, (err, savedUserData) => {
  //       if(err) throw 'couldn\'t save sns token'
  //       res.status(200).send({ accepted: true })
  //     })
  //   } catch(e) {
  //     process.env.NODE_ENV !== 'production' && sidewalk.error('Could not POST SNS token')
  //     res.status(500).send(e ? { accepted: false, message: e} : null)
  //   }
  // })
}
