import { User } from '../schemas'
import { IUserModel } from 'schemas/user'
import sidewalk from '../library/sidewalk'

// User.updateMany({ _id: { $exists: true }}, { 'profile.questions': {
//   'Favorite Hobbies...': '',
//   'The actor who would play me in a movie about my life...': '',
//   'What drives me...': '',
//   'Listener or talker...': ''
// }}, (err, raw) => {
//   console.log(err, raw)
// })

export default function (req, res) {
  sidewalk.warning('Changing User Profile')
  console.log('failed to verify user: ', req.body, req.user._id.toString(), req.body._id === req.user._id.toString())
  if(
    (req.body._id.toString() !== req.user._id.toString()) ||
    (req.body._id !== req.user._id.toString())
  ) {
    console.log('failed to verify user: ', req.body, req.user._id)
    res.status(500).send({ accepted: false })
  } else {
    
    User.findByIdAndUpdate(
      req.user._id,
      req.body,
      {
        new: true,
        projection: {
          age: true,
          admin: true,
          name: true,
          birth: true,
          // registered: true,
          hideProfile: true,
          significantOther: true,
          sms: true,
          tokens: true,
          profile: true,
          searchSettings: true,
        }
      },
      (err, savedUser) => {
      if(err || savedUser === undefined || !savedUser || !savedUser._id) res.status(500).send({ accepted: true })
      console.log('SAVED USER', savedUser)
      const jsonUser = savedUser.toJSON()
      if(jsonUser.admin) {
        jsonUser.canSummonControlPanel = true
      } else if(typeof jsonUser.admin !== 'undefined') {
        delete jsonUser.admin
      }
      console.log('RETURNED USER: ', jsonUser)
      res.status(200).send(jsonUser)
    })
  }
  // User.findById(req.user._id, (err, user) => {
  //   if(err || !user) res.status(500).send()
  //   sidewalk.success('found user', user)
  //   const changes = req.body
  //   user.profile.gender = changes.gender || user.profile.gender
  //   user.searchSettings.sexualPreference = ((): 'male' | 'female' | 'everyone' => {
  //     if(changes.sexualPreference) {
  //       const pref = changes.sexualPreference.toLowerCase()
  //       if(pref === 'male' || pref === 'men') {
  //         return 'male'
  //       }
  //       if(pref === 'female' || pref === 'women') {
  //         return 'female'
  //       }
  //       return 'everyone' as 'everyone'
  //     }
  //     return user.searchSettings.sexualPreference
  //   })() || user.searchSettings.sexualPreference
  //   user.profile.images = changes.photos || user.profile.images
  //   user.profile.food = changes.food || user.profile.food
  //   user.name = changes.name || user.name
  //   user.birth = changes.birth || user.birth
  //   user.profile.goal = changes.goal || user.profile.goal
  //   if(
  //     user.profile && user.searchSettings &&
  //     user.profile.gender &&
  //     user.searchSettings.sexualPreference &&
  //     user.profile.images &&
  //     user.profile.images.length >= 3 &&
  //     user.profile.food &&
  //     user.profile.food.length > 1 &&
  //     user.name &&
  //     user.birth &&
  //     user.profile.goal
  //   ) {
  //     user.registered = new Date()
  //   }
  //   user.save((err, savedUser) => {
  //     if(err || !savedUser) {
  //       sidewalk.error('Could not save user profile changes')
  //       res.status(500).send()
  //     } else {
  //       sidewalk.success('Saved User Changes')
  //       res.status(200).send({ accepted: true })
  //     }
  //   })
  // })
}
