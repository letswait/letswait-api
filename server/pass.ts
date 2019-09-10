// Setup Passport
import * as passport from 'passport'
import { Strategy as FacebookStrategy } from 'passport-facebook'
import { Strategy as LocalStrategy} from 'passport-local'
import CONFIG from './config'
import { User } from './schemas'
import { genRandomNumbers } from './library/util'
import { IUserDevice } from 'types/user'
import crypto = require('crypto')
import moment = require('moment');
import sidewalk from './library/sidewalk'

passport.serializeUser(function(user: any, done) {
  // console.log('serialize User: ', user)
  return done(null, user._id)
});
 
passport.deserializeUser(function(id, done) {
  // console.log('deserialize User: ', id)
  User.findById(id, function (err, user) {
    if(err) return done(err)
    return done(null, user);
  });
});

/**
 * @todo Add UUID Query to request clientside. needs to get access to FAcebook Login First Though
 */
passport.use(new FacebookStrategy({
  clientID: CONFIG.facebookId,
  clientSecret: CONFIG.facebookSecret,
  callbackURL: CONFIG.facebookCallback,
  profileFields: ['id', 'first_name', 'gender', 'age_range', 'birthday', 'significant_other'],
  passReqToCallback: true,
},
(req: any, accessToken, refreshToken, profile: any, done) => {
  // Check if there is a uuid supplied
  const uuid = req.query.state
  // if(!uuid) return done('There was no uuid supplied')
  return done('facebook Strategy disabled')
  // check if is old enough to use the app
  // const {
  //   id,
  //   first_name,
  //   gender,
  //   age_range,
  //   birthday,
  //   significant_other,
  // } = profile
  // // if(age_range && age_range.min >= 18) return done('not old enough')
  // // Setup Device Object
  // const immutableDeviceValues = {
  //       /**
  //        * SNS Token
  //        */
  //       token: '',
  //       /**
  //        * Track OS, can overwrite later when device uuid
  //        * posts the APN / Google Push Notification
  //        */
  //       os: req.headers.os,
  // }
  // const mutableDeviceValues = {
  //       /**
  //        * Generate Simple Access Token, Live for 2 hours,
  //        * Passport generates a persisting session through,
  //        * cookies, so user session information is not
  //        * shared with the server, additionally this heavily
  //        * simplifies running a docker swarm since theres no
  //        * session to balance between server instances.
  //        * we have a built in authentication to protect
  //        * "sensitive" user interactions. However, the
  //        * chat will probably be encoded according to 
  //        * session cookie information, so it will work
  //        * at all times, but only for the devices that can
  //        * access them.
  //        */
  //       accessToken: crypto.randomBytes(18).toString('hex'),
  //       expiresOn: moment().add(2, 'hours').toDate(),
  //       /**
  //        * Generate Permanent refresh Token for device uuid,
  //        * Here we use Crypto to ensure randomness and make
  //        * Collisions a near impossibility.
  //        */
  //       refreshToken: `${uuid}.${crypto.randomBytes(40).toString('hex')}`,
  //       lastLogin: new Date(),
  // }
  // // Find User
  // User.findOne({ facebookId: id }, (err, user) => {
  //   if(err) return done(err)
  //   // Create user if none found
  //   if(!user) {
  //     user = new User({
  //       facebookId: id,
  //       ...(birthday && birthday.length === 8 ? { birth: birthday } : null),
  //       ...(first_name ? { name: first_name } : null),
  //       ...(significant_other ? { significantOther: significant_other } : null),
  //       profile: {
  //         ...(gender ? { gender } : null),
  //       },
  //       devices: new Map<string, IUserDevice>([
  //         [uuid, Object.assign({},
  //           immutableDeviceValues,
  //           mutableDeviceValues,
  //         )]
  //       ]),
  //       searchSettings: {},
  //     })
  //     // sidewalk.warning('Creating FB User...')
  //     User.create(user, (err, savedUser) => {
  //       if(err || !savedUser) {
  //         // sidewalk.error('ERROR: Could not create FB User')
  //         return done(err)
  //       }
  //       // sidewalk.success('Created FB User')
  //       return done(null, savedUser)
  //     })
  //   } else {
  //     // check for device uuid, if none exists, create new one
  //     const device = user.devices.get(uuid)
  //     if(!device) {
  //       user.devices.set(uuid, Object.assign({},
  //         immutableDeviceValues,
  //         mutableDeviceValues,
  //       ))
  //     } else { // Otherwise, edit the existing device
  //       user.devices.set(uuid, Object.assign({},
  //         immutableDeviceValues,
  //         device,
  //         mutableDeviceValues,
  //       )) 
  //     }
  //     // sidewalk.warning('Saving FB User Login...')
  //     const userObject = user.toObject()
  //     user.save((err, savedUser) => {
  //       if(err || !savedUser) {
  //         // sidewalk.error('ERROR: Could not save FB User')
  //         return done(err)
  //       }
  //       // sidewalk.success('Saved User')
  //       return done(null, savedUser)
  //     })
  //   }
  // })
}))

/**
 * @method LocalStrategy
 * @description Passport SMS Authentication
 */
passport.use(new LocalStrategy({
  usernameField: 'sms',
  passwordField: 'sms',
  session: true,
  passReqToCallback: true,
},
async (req: any, username, password, done) => {
  // Check for UUID
  if(!req.headers.uuid) return done('There was no uuid supplied')
  // Find User against unique identifier supplied by request

  const accessToken = crypto.randomBytes(18).toString('hex')
  const expiresOn = moment().add(2, 'hours').toDate()
  const refreshToken = `${req.headers.uuid}.${crypto.randomBytes(40).toString('hex')}`
  const activeCode = genRandomNumbers()
  
  let user = await User.findOneAndUpdate(
    {
      sms: username,
      'devices._id': req.headers.uuid,
    },
    {
      // // This runs on Account Creation
      // $setOnInsert: {
      //   sms: username,
      //   searchSettings: {},
      //   profile: {},
      //   devices: [{
      //     uuid: req.headers.uuid,
      //     token: '',
      //     os: req.headers.os || 'unset',
      //   }]
      // },
      // additionally...
      $set: {
        'devices.$': {
          $set: {
            /**
             * Generate Simple Access Token, Live for 2 hours,
             * Passport generates a persisting session through,
             * cookies, so user session information is not
             * shared with the server, additionally this heavily
             * simplifies running a docker swarm since theres no
             * session to balance between server instances.
             * we have a built in authentication to protect
             * "sensitive" user interactions. However, the
             * chat will probably be encoded according to 
             * session cookie information, so it will work
             * at all times, but only for the devices that can
             * access them.
             */
            accessToken,
            expiresOn,
            /**
             * Generate Permanent refresh Token for device uuid,
             * Here we use Crypto to ensure randomness and make
             * Collisions a near impossibility.
             */
            refreshToken,
            // SMS Code, not present in Facebook and Apple Logins
            activeCode,
            // SMS Code Validation, not in Facebook or Apple Logins
            codeValid: false,
          }
        }
      }
    },
    {
      new: true,
    },
  ).exec()

  if(user) return done(null, user)
 
  user = await User.findOneAndUpdate(
    {
      sms: username,
    },
    {
      $addToSet: {
        devices: {
          _id: req.headers.uuid,
          token: '',
          os: req.headers.os || 'unset',
          accessToken,
          expiresOn,
          refreshToken,
          activeCode,
          codeValid: false,
        }
      }
    },
    {
      new: true,
    },
  ).exec()

  if(user) return done(null, user)

  user = await User.findOneAndUpdate(
    {
      sms: username,
    },
    {
      $setOnInsert: {
        sms: username,
        searchSettings: {},
        profile: {},
        devices: [{
          _id: req.headers.uuid,
          token: '',
          os: req.headers.os || 'unset',
          accessToken,
          expiresOn,
          refreshToken,
          activeCode,
          codeValid: false,
        }],
      },
    },
    {
      upsert: true,
      new: true,
    },
  ).exec()

  if(!user) return done('couldnt find user')

  return done(null, user)
}))

export function auth(req, res, next: () => any) {
  // sidewalk.warning(`Authenticating Passport for route: ${JSON.stringify(req.route)}`)
  // !req.isAuthenticated() && req.login()
  if(req.isAuthenticated()) {
    // sidewalk.success('Passport Authentication Successful')
    return next()
  } else {
    // sidewalk.error('Could not Authenticate Passport')
    res.status(500).redirect('/')
  }
}

export function ensureAuthenticated(req: any, res: any, next: () => any) {
  try {
    // sidewalk.warning(`Authenticating Passport for route: ${req.route}`)
    if(req.isAuthenticated() && req.user) {
      // sidewalk.success('Passport Authentication Successful')
      /**
       * @todo check if this block does anything, might be able to prune it
       */
      if(req.user.sms || req.user.facebookId) {
        passportAllEnsure()
      } else if(req.user.facebookId) {
        passportAllEnsure()
      } else {
        return next()
      }
    } else {
      throw 'Could not Authenticate Passport'
    }

    // This Function will check system auth
    /**
     * @todo Change this to modern user format
     */
    function passportAllEnsure() {
      // sidewalk.warning('Ensuring Authentication...')
      const device = req.user.devices.get(req.headers.uuid)
      if(device) {
        // Check if Auth Token valid
        const expiresOn = moment(device.expiresOn)
        const expired = expiresOn.isValid() ? expiresOn.isSameOrBefore(moment()) : true
        if(!expired) {
          // sidewalk.success('✓ Token Valid, User Authenticated! ✓')
          return next()
        } else if(device.refreshToken) {
          if(req.headers.refreshToken) {
            // sidewalk.success('✓ Access Token Requested, Generating... ✓')
            return next()
          } else {
            // sidewalk.warning('Token Expired, Requesting Refresh Token...')
            res.status(200).send({ accepted: false, requestRefreshToken: true})
          }
        } else {
          throw 'No Refresh Token found for this device... Something is wrong'
        }
      } else {
        throw `Device not found: ${req.headers.uuid || ''}`
      }
    }
  } catch(e) {
    // e && sidewalk.error(`ERROR: ${e}`)
    res.redirect('/')
  }
}
