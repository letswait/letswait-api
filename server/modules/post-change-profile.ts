import { User } from '../schemas'
import { IUserModel } from 'schemas/user'
import sidewalk from '../library/sidewalk'

export default function (req, res) {
  // sidewalk.warning('Changing User Profile')
  User.findById(req.user._id, (err, user) => {
    if(err || !user) res.status(500).send()
    // sidewalk.success('found user', user)
    const changes = req.body
    user.profile.gender = changes.gender || user.profile.gender
    user.searchSettings.sexualPreference = ((): 'male' | 'female' | 'everyone' => {
      if(changes.sexualPreference) {
        const pref = changes.sexualPreference.toLowerCase()
        if(pref === 'male' || pref === 'men') {
          return 'male'
        }
        if(pref === 'female' || pref === 'women') {
          return 'female'
        }
        return 'everyone' as 'everyone'
      }
      return user.searchSettings.sexualPreference
    })() || user.searchSettings.sexualPreference
    user.profile.images = changes.photos || user.profile.images
    user.profile.food = changes.food || user.profile.food
    user.name = changes.name || user.name
    user.birth = changes.birth || user.birth
    user.profile.goal = changes.goal || user.profile.goal
    if(
      user.profile && user.searchSettings &&
      user.profile.gender &&
      user.searchSettings.sexualPreference &&
      user.profile.images &&
      user.profile.images.length >= 3 &&
      user.profile.food &&
      user.profile.food.length > 1 &&
      user.name &&
      user.birth &&
      user.profile.goal
    ) {
      user.registered = new Date()
    }
    user.save((err, savedUser) => {
      if(err || !savedUser) {
        // sidewalk.error('Could not save user profile changes')
        res.status(500).send()
      } else {
        // sidewalk.success('Saved User Changes')
        res.status(200).send({ accepted: true })
      }
    })
  })
}
