import * as twilio from 'twilio'
import config from '../config'
import { User } from '../schemas'
import { IUserDevice } from 'types/user';
import { IUserModel } from 'schemas/user';


export default {
  send: (req: any, res: any) => {
    console.log('sending sms code')
    const { sms, devices }: { sms: string, devices: Map<string, IUserDevice>} = req.user
    const {
      activeCode,
      codeValid,
      accessToken,
      refreshToken,
    } = req.user.devices.get(req.headers.uuid)
    if(sms && activeCode && !codeValid) {
      console.log('should send sms code')
      const client = twilio(config.twilioSID, config.twilioAuth)
      client.messages.create({
        body: `Your Let's Wait verification code is ${activeCode}`,
        to: sms,
        from: config.twilioNumbers[0],
      }).then((message: any) => {
        console.log('sent twilio message to ', sms)
        res.status('200').send({
          accepted: true,
          redirect: '/setup/code',
          authToken: accessToken,
          refreshToken: refreshToken,
        })
      })
    } else {
      res.status('500').send({ accepted: true, redirect: '/' })
    }
  },
  receive: (req: any, res: any) => {
    console.log('receiving sms code', req.body.code)
    console.log(req, req.user)
    try {
      if(!req.user || (req.user && req.user.sms !== req.body.sms)) throw 'incorrect sms'
      const device = req.user.devices.get(req.headers.uuid)
      if(device) {
        const activeCode = device.activeCode
        if(activeCode === req.body.code) {
          const target = {
            [`devices.${req.headers.uuid}.codeValid`]: true,
            [`devices.${req.headers.uuid}.lastLogin`]: new Date(),
          }
          User.findByIdAndUpdate(req.user._id, { $set: target }, (err, savedUser) => {
            if(err) throw 'couldnt log in natively'
            if(savedUser) {
              if(savedUser.registered) {
                res.status('200').send({ accepted: true, user: savedUser})
              } else {
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
        } else {
          throw 'incorrect code'
        }
      } else {
        throw 'uuid unkown'
      }
    } catch(e) {
      console.log('received code error: ', e)
      res.status('500').send()
    }
  }
}
