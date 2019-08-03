import * as twilio from 'twilio'
import config from '../config'
import { User } from '../schemas'
import { IUserDevice } from 'types/user';
import { IUserModel } from 'schemas/user';

import sidewalk from 'library/sidewalk'

export default {
  send: (req: any, res: any) => {
    const { sms, devices }: { sms: string, devices: Map<string, IUserDevice>} = req.user
    sidewalk.warning(`Receiving SMS Number: ${sms}`)
    // Get Device
    const {
      activeCode,
      codeValid,
      accessToken,
      refreshToken,
    } = req.user.devices.get(req.headers.uuid)
    if(sms && activeCode && !codeValid) {
      // Create Twilio Instance
      const client = twilio(config.twilioSID, config.twilioAuth)
      client.messages.create({
        body: `Your Let's Wait verification code is ${activeCode}`,
        to: sms,
        from: config.twilioNumbers[0],
      }).then((message: any) => {
        sidewalk.success('Sent SMS Code to client')
        res.status('200').send({
          accepted: true,
          redirect: '/setup/code',
          authToken: accessToken,
          refreshToken: refreshToken,
        })
      })
    } else {
      res.status('500').redirect('/setup/sms')
    }
  },
  receive: (req: any, res: any) => {
    sidewalk.warning(`Receiving SMS Code: ${req.body.code}`)
    try {
      if(!req.user || (req.user && req.user.sms !== req.body.sms)) throw 'incorrect sms'
      const device = req.user.devices.get(req.headers.uuid)
      if(device) {
        const activeCode = device.activeCode
        if(activeCode === req.body.code) {
          sidewalk.success('SMS Code Valid')
          const target = {
            [`devices.${req.headers.uuid}.codeValid`]: true,
            [`devices.${req.headers.uuid}.lastLogin`]: new Date(),
          }
          User.findByIdAndUpdate(req.user._id, { $set: target }, (err, savedUser) => {
            if(err) throw 'Couldn\'t Log In'
            if(savedUser) {
              sidewalk.success('Saved User')
              if(savedUser.registered) {
                sidewalk.warning(`User Registered: Sending to app`)
                res.status('200').send({ accepted: true, user: savedUser})
              } else {
                sidewalk.warning(`User not registered, Sending Setup Routes`)
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
          throw 'Incorrect SMS Code'
        }
      } else {
        throw 'Unknown UUID'
      }
    } catch(e) {
      e && sidewalk.error(e, true)
      res.status('500').send()
    }
  }
}
