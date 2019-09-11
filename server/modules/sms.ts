import * as twilio from 'twilio'
import { User } from '../schemas'
import { IUserDevice } from 'types/user';
import { IUserModel } from 'schemas/user';

import sidewalk from '../library/sidewalk'

export default {
  send: (req: any, res: any) => {
    const { sms, devices }: { sms: string, devices: IUserDevice[]} = req.user
    // sidewalk.warning(`Receiving SMS Number: ${sms}`)
    // Get Device
    const device = (devices as any).id(req.headers.uuid)
    const {
      activeCode,
      codeValid,
      accessToken,
      refreshToken,
    } = device
    if(sms && activeCode && !codeValid) {
      // Create Twilio Instance
      const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH)
      client.messages.create({
        body: `Your Let's Wait verification code is ${activeCode}`,
        to: sms,
        from: process.env.TWILIO_NUMBERS.split(' ')[0],
      }).then((message: any) => {
        // sidewalk.success('Sent SMS Code to client')
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
    // sidewalk.warning(`Receiving SMS Code: ${req.body.code}`)
    try {
      if(!req.user || (req.user && req.user.sms !== req.body.sms)) throw 'incorrect sms'
      let deviceIndex = 0
      const device = req.user.devices.filter((device, i, arr) => {
        deviceIndex = i
        return device._id === req.headers.uuid
      })[0]
      if(device) {
        const activeCode = device.activeCode
        if(activeCode === req.body.code) {
          // sidewalk.success('SMS Code Valid')
          const target = {
            [`devices[${deviceIndex}].codeValid`]: true,
            [`devices[${deviceIndex}].lastLogin`]: new Date(),
          }
          User.findOneAndUpdate(
            { _id: req.user._id }, 
            { $set: target },
            {
              new: true,
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
        } else {
          throw 'Incorrect SMS Code'
        }
      } else {
        throw 'Unknown UUID'
      }
    } catch(e) {
      e && // sidewalk.error(e, true)
      res.status('500').send()
    }
  }
}
