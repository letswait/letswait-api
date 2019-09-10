import { User } from '../schemas'
import { IUserModel } from 'schemas/user'
import sidewalk from '../library/sidewalk'

/**@todo add checking and validation of correct body structure */
export default function (req, res) {
  // sidewalk.warning('Changing User Profile')
  if(
    (req.body._id.toString() !== req.user._id.toString()) ||
    (req.body._id !== req.user._id.toString())
  ) {
    res.status(500).send({ accepted: false })
  } else {
    User.findByIdAndUpdate(
      req.user._id,
      req.body,
      {
        new: true,
        projection: {
          age: true,
          admin: true,
          name: true,
          birth: true,
          hideProfile: true,
          significantOther: true,
          sms: true,
          tokens: true,
          profile: true,
          searchSettings: true,
        }
      },
      (err, savedUser) => {
      if(err || savedUser === undefined || !savedUser || !savedUser._id) res.status(500).send({ accepted: true })
      const jsonUser = savedUser.toJSON()
      if(jsonUser.admin) {
        jsonUser.canSummonControlPanel = true
      } else if(typeof jsonUser.admin !== 'undefined') {
        delete jsonUser.admin
      }
      res.status(200).send(jsonUser)
    })
  }
}
