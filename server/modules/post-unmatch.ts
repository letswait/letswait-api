import { Match } from '../schemas'


export default (req, res) => {
  Match.findOneAndUpdate(
    {
      _id: req.body.matchId,
      [`userProfiles.${req.user._id}`]: { $exists: true }
    }, {
      state: 'suspend',
    }, {
      new: true,
    },
    (err, suspendedMatch) => {
      if(err || !suspendedMatch) res.status(500).send()
      res.status(200).send()
    }
  )
}