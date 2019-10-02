import { User, Match } from '../schemas'
import crypto = require('crypto')
import moment = require('moment')
// import sidewalk from '../library/sidewalk'
// import { IMatch } from '../types/match';
// import chalk from 'chalk';
// import { IUserDocument } from '../types/user';
// import { ObjectOf } from '../types';

// import * as mongoose from 'mongoose'

// (async () => {
//   console.log('Running Cleanup Resolved Matches')
//   const matches: any = await Match.find({ state: { $ne: 'queued' }}).populate({
//     path: 'userProfiles',
//     options: {
//       lean: true,
//     }
//   })

//   let discrepantMatches: mongoose.Schema.Types.ObjectId[] = []
//   let matchCount = 0
//   let issueCount = 0
//   let missingUsers = {}
//   let userMatches: ObjectOf<mongoose.Schema.Types.ObjectId[]> = {}
//   for(let i = matches.length; i--;) {
//     matchCount++
//     if(matches[i].userProfiles.length === 1) {
//       issueCount++
//       findUser(matches[i])
//       flagMatch(matches[i])
//       flagMatch
//       console.log(matches[i].state, chalk.red(chalk.bold(' ::DISCREPENCY')))
//     } else {
//       console.log(matches[i].state)
//     }
//   }
//   console.log('\n\ntotal non-queued matches: ', matchCount, '\n\ntotal discrepencies: ', issueCount)

//   console.log(missingUsers)

//   function findUser(match: IMatch) {
//     const foundUser: IUserDocument = match.userProfiles[0] as any
//     const foundUserId = foundUser._id

//     const missingUserId = Array.from(match.users.keys()).filter((userId, i, arr) => {
//       return userId.toString() !== foundUserId.toString()
//     })[0]
//     missingUsers[missingUserId] = missingUsers[missingUserId] ? missingUsers[missingUserId] + 1 : 1
//   }
//   function flagMatch(match: IMatch) {
//     const userId = (match.userProfiles[0] as any)._id.toString()
//     userMatches[userId] = userMatches[userId] ? userMatches[userId].concat([ match._id ]) : [ match._id ]
//     discrepantMatches = discrepantMatches.concat([ match._id ])
//   }
//   // console.log(discrepantMatches, userMatches)
//   let userMatchKeys = Object.keys(userMatches)
//   console.log(`prepared to delete ${discrepantMatches.length} matches; affecting ${userMatchKeys.length} users`)

//   /** This stuff deletes shit. */
//   // console.log('deleting matches...')
//   // await Match.deleteMany({ _id: { $in: discrepantMatches}})
//   // console.log('deleting matchIds from affected users')
//   // await Promise.all(userMatchKeys.map(async (userId, i, arr) => {
//   //   return await User.updateOne({ _id: userId }, { $pullAll: { matches: userMatches[userId]}})
//   // }))
//   // console.log('users and matches deleted?')
// })()

/**
 * @todo figure out where this is being called from, it doesnt feel right for it to call the user id to refresh a token. :/
 * @param req 
 * @param res 
 */
export default function(req, res) {

  const accessToken = crypto.randomBytes(18).toString('hex')
  const expiresOn = moment().add(2, 'hours').toDate()

  User.findOneAndUpdate(
    {
      _id: req.user._id,
      'devices._id': req.header.uuid,
    },
    {
      $set: {
        'devices.$.accessToken': accessToken,
        'devices.$.expiresOn': expiresOn,
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
    (err, user) => {
      console.log('Got User RefreshToken: ', err, user)

      // Err: couldnt finish query
      // !user: user does not exist, or device has not yet been registered, potential malicious device.
      // user:  got user and updated accessToken and expiry

      /**
       * @todo This block is used multiple times, need to turn it into a factory.
       */
      if(err) throw 'Couldn\'t Log In'
      if(user) {
        // sidewalk.success('Saved User')
        const jsonUser = user.toJSON()
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
            ...(user.birth ? [] : ['/setup/birthdate']),
            ...(user.name ? [] : ['/setup/name']),
            ...(user.profile && user.profile.gender ? [] : ['/setup/gender']),
            ...(user.searchSettings && user.searchSettings.sexualPreference ? [] : ['/setup/sexual-preference']),
            ...(user.profile && user.profile.images.length ? [] : ['/setup/photo-upload']),
            ...(user.profile && user.profile.food.length ? [] : ['/setup/food-interests']),
            ...(user.profile && user.profile.goal ? [] : ['/setup/goals']),
          ]})
        }
      } else {
        // sidewalk.error('Something went wrong, Potential Malicious Attack from refreshToken.js')
        res.redirect('/')
      }
    }
  )




  // User.findById(req.user._id, (err, user) => {
  //   if(err || !user) res.redirect && res.redirect('/')
  //   sidewalk.warning('Refreshing access token')
  //   const accessToken = crypto.randomBytes(18).toString('hex')
  //   const expiresOn = moment().add(2, 'hours').toDate()
  //   user.devices.set(req.headers.uuid, {
  //     ...user.devices.get(req.headers.uuid),
  //     accessToken,
  //     expiresOn,
  //   })
  //   user.save((err, savedUser) => {
  //     if(err || !savedUser) {
  //       res.redirect && res.redirect('/')
  //     } else {
  //       let mutableUser = user.toObject()
  //       delete mutableUser.devices
  //       if(!mutableUser.registered) {
  //         /** @todo abstract this into its own module */
  //         res.status('200').send({ accepted: true, remainingSetupRoutes: [
  //           ...(mutableUser.birth ? [] : ['/setup/birthdate']),
  //           ...(mutableUser.name ? [] : ['/setup/name']),
  //           ...(mutableUser.profile && mutableUser.profile.gender ? [] : ['/setup/gender']),
  //           ...(mutableUser.searchSettings && mutableUser.searchSettings.sexualPreference ? [] : ['/setup/sexual-preference']),
  //           ...(mutableUser.profile && mutableUser.profile.images.length ? [] : ['/setup/photo-upload']),
  //           ...(mutableUser.profile && mutableUser.profile.food.length ? [] : ['/setup/food-interests']),
  //           ...(mutableUser.profile && mutableUser.profile.goal ? [] : ['/setup/goals']),
  //         ]})
  //       } else {
  //         res.status(200).send({ accepted: true, accessToken, expiresOn, user: mutableUser }) 
  //       }
  //     }
    // })
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
  // })
}