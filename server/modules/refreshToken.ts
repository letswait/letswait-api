import { User } from '../schemas'
import crypto = require('crypto')
import moment = require('moment')

export default function(req, res) {
  console.log('refreshing access token?')
  User.findById(req.user._id, (err, user) => {
    if(err || !user) res.redirect('/')
    console.log('refreshing access token')
    const accessToken = crypto.randomBytes(18).toString('hex')
    const expiresOn = moment().add(2, 'hours').toDate()
    user.devices.set(req.headers.uuid, {
      ...user.devices.get(req.headers.uuid),
      accessToken,
      expiresOn,
    })
    User.updateOne(user, (err, res) => {
      if(err || !res) {
        res.redirect('/')
      } else {
        let savedUser = Object.assign({}, user, { devices: undefined })
        delete savedUser.devices
        if(!savedUser.registered) {
          /** @todo abstract this into its own module */
          res.status('200').send({ accepted: true, remainingSetupRoutes: [
            ...(savedUser.birth ? [] : ['/setup/birthdate']),
            ...(savedUser.name ? [] : ['/setup/name']),
            ...(savedUser.profile && savedUser.profile.gender ? [] : ['/setup/gender']),
            ...(savedUser.searchSettings && savedUser.searchSettings.sexualPreference ? [] : ['/setup/sexual-preference']),
            ...(savedUser.profile && savedUser.profile.images.length ? [] : ['/setup/photo-upload']),
            ...(savedUser.profile && savedUser.profile.food.length ? [] : ['/setup/food-interests']),
            ...(savedUser.profile && savedUser.profile.goal ? [] : ['/setup/goals']),
          ]})
        } else {
          res.status(200).send({ accepted: true, accessToken, expiresOn, user: savedUser }) 
        }
      }
    })

    // user.save((err, savedUser) => {
    //   if(err || !savedUser) res.redirect('/')
    //   delete savedUser.devices
    //   if(!savedUser.registered) {
    //     /** @todo abstract this into its own module */
    //     res.status('200').send({ accepted: true, remainingSetupRoutes: [
    //       ...(savedUser.birth ? [] : ['/setup/birthdate']),
    //       ...(savedUser.name ? [] : ['/setup/name']),
    //       ...(savedUser.profile && savedUser.profile.gender ? [] : ['/setup/gender']),
    //       ...(savedUser.searchSettings && savedUser.searchSettings.sexualPreference ? [] : ['/setup/sexual-preference']),
    //       ...(savedUser.profile && savedUser.profile.images.length ? [] : ['/setup/photo-upload']),
    //       ...(savedUser.profile && savedUser.profile.food.length ? [] : ['/setup/food-interests']),
    //       ...(savedUser.profile && savedUser.profile.goal ? [] : ['/setup/goals']),
    //     ]})
    //   } else {
    //     res.status(200).send({ accepted: true, accessToken, expiresOn, user: savedUser })
    //   }
    // })
  })
}