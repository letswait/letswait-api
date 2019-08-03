import { User } from '../schemas'
import sidewalk from '../library/sidewalk'

export default function(req: any, res) {
  sidewalk.warning(`Checking user authentication: ${req.user_id}`)
  User.findById(req.user._id, (err, user) => {
    if(err || !user) res.status(500).send({accepted: false})
    if(user.registered) {
      sidewalk.success('User already registered, sharing user profile')
      let mutableUser = user.toObject()
      delete mutableUser.devices
      res.status(200).send({ accepted: true, user: mutableUser })
    } else {
      sidewalk.detour('User not registered, sending signup routes...')
      res.status(200).send({ accepted: true, remainingSetupRoutes: [
        ...(user.birth ? [] : ['/setup/birthdate']),
        ...(user.name ? [] : ['/setup/name']),
        ...(user.profile && user.profile.gender ? [] : ['/setup/gender']),
        ...(user.searchSettings && user.searchSettings.sexualPreference ? [] : ['/setup/sexual-preference']),
        ...(user.profile && user.profile.images.length ? [] : ['/setup/photo-upload']),
        ...(user.profile && user.profile.food.length ? [] : ['/setup/food-interests']),
        ...(user.profile && user.profile.goal ? [] : ['/setup/goals']),
      ]})
    }
  })
}