import { Match } from '../schemas'
import * as mongoose from 'mongoose'

export default (req, res) => {
  // req.body.matchId, req.body.userId, req.body.reason, req.body.comment
  /** @todo integrate Block and Report Action */
  Match.findOneAndUpdate(
    {
      _id: req.body.matchId,
      [`userProfiles.${req.user._id}`]: { $exists: true },
      [`userProfiles.${req.body.userId}`]: { $exists: true }
    }, {
      state: 'blocked',
    }, {
      new: true,
    },
    (err, blockedMatch) => {
      if(err || !blockedMatch) return res.status(500).send()
      const blockedUser = !!req.body.userId.toString ? req.body.userId : mongoose.Types.ObjectId(req.body.userId)
      req.user.updateOne({ $addToSet: { blockedUsers: blockedUser } }, (err, oldUser) => {
        if(err) return res.status.send()
        res.status(200).send()
        if(req.body.reason) {
          // Build Email and create case
          /**
           * @todo This is a reporting hook, publish report action and send email notifying LetsWait.
           */
        } else {
          /**
           * @todo This is a blocking hook, publish block action
           */
        }
      })
    }
  )
}