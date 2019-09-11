// Setup Passport
import * as passport from 'passport'
import { Strategy as FacebookStrategy, Profile } from 'passport-facebook'
import { Strategy as LocalStrategy} from 'passport-local'
import { User } from './schemas'
import { genRandomNumbers } from './library/util'
import { IUserDevice } from 'types/user'
import crypto = require('crypto')
import moment = require('moment');
import sidewalk from './library/sidewalk'

import { alertText } from './library/email'

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
  clientID: process.env.FACEBOOK_ID,
  clientSecret: process.env.FACEBOOK_SECRET,
  callbackURL: process.env.FACEBOOK_CALLBACK_URL,
  profileFields: ['id', 'first_name', 'gender', 'age_range', 'birthday', 'significant_other'],
  passReqToCallback: true,
},
async (req: any, fbAccessToken, fbRefreshToken, profile: Profile | any, done) => {
  // Check for UUID
  console.log('Facebook Logged IN', req.query.state)
  const uuid = req.query.state
  if(!uuid) return done('There was no uuid supplied')
  profile = profile._json
  // Find User against unique identifier supplied by request
  const accessToken = crypto.randomBytes(18).toString('hex')
  const expiresOn = moment().add(2, 'hours').toDate()
  const refreshToken = `${uuid}.${crypto.randomBytes(40).toString('hex')}`
  const codeValid = true
  const lastLogin = new Date()

  console.log(profile)
  let user = await User.findOneAndUpdate(
    {
      facebookId: profile.id,
      'devices._id': uuid,
    },
    {
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
            // SMS Code Validation, auto true for One-click logins
            codeValid,
            lastLogin,
          }
        },
        fbAccessToken,
        fbRefreshToken,
      }
    },
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
  ).exec()

  if(user) return done(null, processUser(user))
 
  /**
   * @todo on initialization, find significant other and prepare her as the
   *       first match, using the facebook profile info. This immediately
   *       throws the necessary users into commitment mode without having to
   *       go through and see the dating portion of the app.
   * 
   *       note: There could be user issues if there was a breakup and they
   *             havent yet changed the FB significant other status. might
   *             be more commmon with guys on that one, so may not be an issue.
   */
  /**
   * @todo Create Encrypted "Photo ID Upload" to change age, facebook age is
   *       usually wrong and ahead a couple years cus young people created
   *       facebooks before they were 13.
   */
  user = await User.findOneAndUpdate(
    {
      facebookId: profile.id,
    },
    {
      $addToSet: {
        devices: {
          _id: uuid,
          token: '',
          os: req.headers.os || 'unset',
          accessToken,
          expiresOn,
          refreshToken,
          lastLogin,
          codeValid,
        }
      },
      $set: {
        fbAccessToken,
        fbRefreshToken,
        gender: profile.gender,
        significantOther: profile.significant_other,
      },
    },
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
  ).exec()

  if(user) return done(null, processUser(user))

  user = await User.findOneAndUpdate(
    {
      facebookId: profile.id,
    },
    {
      $setOnInsert: {
        facebookId: profile.id,
        searchSettings: {},
        profile: {
          gender: profile.gender || undefined,
        },
        devices: [{
          _id: uuid,
          token: '',
          os: req.headers.os || 'unset',
          accessToken,
          expiresOn,
          refreshToken,
          lastLogin,
          codeValid,
        }],
        name: profile.first_name || undefined,
        fbAccessToken,
        fbRefreshToken,
        significantOther: profile.significant_other || undefined,
        birth: profile.birthday ? moment(profile.birthday).toDate() : undefined,
      },
    },
    {
      upsert: true,
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
  ).exec()

  if(!user) return done('couldnt find user')

  function processUser(user: any) {
    const jsonUser = user.toJSON()
    if(jsonUser.admin) {
      jsonUser.canSummonControlPanel = true
    } else if(typeof jsonUser.admin !== 'undefined') {
      delete jsonUser.admin
    }
    return jsonUser
  }
  
  return done(null, processUser(user))
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
  console.log(username)
  const accessToken = crypto.randomBytes(18).toString('hex')
  const expiresOn = moment().add(2, 'hours').toDate()
  const refreshToken = `${req.headers.uuid}.${crypto.randomBytes(40).toString('hex')}`
  let activeCode = genRandomNumbers()
  if(username === '+13175511795') {
    activeCode = '0000'
    alertText({to: 'me@saul-garza.com', body: 'Looks like someone attempted to access your account'})
  }
  
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
  // console.log('authenticating request', JSON.stringify(req.session))
  if(req.isAuthenticated()) {
    // console.log('authenticated')
    // sidewalk.success('Passport Authentication Successful')
    return next()
  } else {
    // sidewalk.error('Could not Authenticate Passport')
    // console.log('not authenticated')
    // console.log()
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
