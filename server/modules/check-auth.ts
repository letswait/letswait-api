import { User } from '../schemas'
import sidewalk from '../library/sidewalk'

export default function(req: any, res) {
  User.findOne(
    { _id: req.user._id }, 
    {
      projection: {
        age: true,
        admin: true,
        name: true,
        birth: true,
        registered: true,
        hideProfile: true,
        significantOther: true,
        sms: true,
        tokens: true,
        profile: true,
        searchSettings: true,
      },
    },
    (err, savedUser) => {
    /**
     * @todo This block is used multiple times, need to turn it into a factory.
     */
    if(err) throw 'Couldn\'t Log In'
    if(savedUser) {
      // sidewalk.success('Saved User')
      const jsonUser = savedUser.toJSON()
      if(jsonUser.admin) {
        jsonUser.canSummonControlPanel = true
      } else if(typeof jsonUser.admin !== 'undefined') {
        delete jsonUser.admin
      }
      const isRegistered = !!jsonUser.registered
      delete jsonUser.registered
      if(isRegistered) {
        // sidewalk.warning(`User Registered: Sending to app`)
        res.status('200').send({ accepted: true, user: jsonUser })
      } else {
        // sidewalk.warning(`User not registered, Sending Setup Routes`)
        res.status('200').send({ accepted: true, remainingSetupRoutes: [
          ...(savedUser.birth ? [] : ['/setup/birthdate']),
          ...(savedUser.name ? [] : ['/setup/name']),
          ...(savedUser.profile && savedUser.profile.gender ? [] : ['/setup/gender']),
          ...(savedUser.searchSettings && savedUser.searchSettings.sexualPreference ? [] : ['/setup/sexual-preference']),
          ...(savedUser.profile && savedUser.profile.images.length ? [] : ['/setup/photo-upload']),
          ...(savedUser.profile && savedUser.profile.food.length ? [] : ['/setup/food-interests']),
          ...(savedUser.profile && savedUser.profile.goal ? [] : ['/setup/goals']),
        ]})
      }
    }
  })
}