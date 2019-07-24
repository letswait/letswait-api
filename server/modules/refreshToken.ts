import { User } from '../schemas'
import crypto = require('crypto')
import moment = require('moment')

export default function(req, res) {
  console.log('refreshing access token?')
  User.findById(req.user._id, (err, user) => {
    if(err || !user) res.redirect && res.redirect('/')
    console.log('refreshing access token')
    const accessToken = crypto.randomBytes(18).toString('hex')
    const expiresOn = moment().add(2, 'hours').toDate()
    user.devices.set(req.headers.uuid, {
      ...user.devices.get(req.headers.uuid),
      accessToken,
      expiresOn,
    })
    user.save((err, savedUser) => {
      if(err || !savedUser) {
        res.redirect && res.redirect('/')
      } else {
        let mutableUser = user.toObject()
        delete mutableUser.devices
        if(!mutableUser.registered) {
          /** @todo abstract this into its own module */
          res.status('200').send({ accepted: true, remainingSetupRoutes: [
            ...(mutableUser.birth ? [] : ['/setup/birthdate']),
            ...(mutableUser.name ? [] : ['/setup/name']),
            ...(mutableUser.profile && mutableUser.profile.gender ? [] : ['/setup/gender']),
            ...(mutableUser.searchSettings && mutableUser.searchSettings.sexualPreference ? [] : ['/setup/sexual-preference']),
            ...(mutableUser.profile && mutableUser.profile.images.length ? [] : ['/setup/photo-upload']),
            ...(mutableUser.profile && mutableUser.profile.food.length ? [] : ['/setup/food-interests']),
            ...(mutableUser.profile && mutableUser.profile.goal ? [] : ['/setup/goals']),
          ]})
        } else {
          res.status(200).send({ accepted: true, accessToken, expiresOn, user: mutableUser }) 
        }
      }
    })
    // User.updateOne(user, (err, res) => {
    //   if(err || !res) {
    //     res.redirect('/')
    //   } else {
    //     let mutableUser = user.toObject()
    //     delete mutableUser.devices
    //     if(!mutableUser.registered) {
    //       /** @todo abstract this into its own module */
    //       res.status('200').send({ accepted: true, remainingSetupRoutes: [
    //         ...(mutableUser.birth ? [] : ['/setup/birthdate']),
    //         ...(mutableUser.name ? [] : ['/setup/name']),
    //         ...(mutableUser.profile && mutableUser.profile.gender ? [] : ['/setup/gender']),
    //         ...(mutableUser.searchSettings && mutableUser.searchSettings.sexualPreference ? [] : ['/setup/sexual-preference']),
    //         ...(mutableUser.profile && mutableUser.profile.images.length ? [] : ['/setup/photo-upload']),
    //         ...(mutableUser.profile && mutableUser.profile.food.length ? [] : ['/setup/food-interests']),
    //         ...(mutableUser.profile && mutableUser.profile.goal ? [] : ['/setup/goals']),
    //       ]})
    //     } else {
    //       res.status(200).send({ accepted: true, accessToken, expiresOn, user: mutableUser }) 
    //     }
    //   }
    // })

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