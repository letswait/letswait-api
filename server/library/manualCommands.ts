import { User, Venue, Match } from '../schemas'
import * as mongoose from 'mongoose'
import { ObjectOf } from '../types'
import { IMatch } from '../types/match'
import { IUserDocument } from '../types/user'
import chalk from 'chalk'

export function deleteBots() {
  console.log('deleting all bots')
  User.find({ isBot: true }, (err, res) => {
    if(err || !res) return console.log('nothing retrieved!')
    res.forEach((bot, i, arr) => {
      clearMatches(bot.matches)
      bot.remove()
    })
  })
}

export function clearMatches(matches: any[]) {
  console.log('clearing user matches')
  const matchList = [...matches]
  matchList.forEach((matchId, i, arr) => {
    Match.findByIdAndRemove(matchId)
  })
}

export function clearUserMatches() {
  User.findOneAndUpdate({name: 'Saul'}, { matches: [] })
}

export async function cleanupResolvedMatches(deleteResults= false) {
  console.log('Running Cleanup Resolved Matches')
  const matches: any = await Match.find({ state: { $ne: 'queued' }}).populate({
    path: 'userProfiles',
    options: {
      lean: true,
    }
  })

  let discrepantMatches: mongoose.Schema.Types.ObjectId[] = []
  let matchCount = 0
  let issueCount = 0
  let missingUsers = {}
  let userMatches: ObjectOf<mongoose.Schema.Types.ObjectId[]> = {}
  for(let i = matches.length; i--;) {
    matchCount++
    if(matches[i].userProfiles.length === 1) {
      issueCount++
      findUser(matches[i])
      flagMatch(matches[i])
      flagMatch
      console.log(matches[i].state, chalk.red(chalk.bold(' ::DISCREPENCY')))
    } else {
      console.log(matches[i].state)
    }
  }
  console.log('\n\ntotal non-queued matches: ', matchCount, '\n\ntotal discrepencies: ', issueCount)

  console.log(missingUsers)

  function findUser(match: IMatch) {
    const foundUser: IUserDocument = match.userProfiles[0] as any
    const foundUserId = foundUser._id

    const missingUserId = Array.from(match.users.keys()).filter((userId, i, arr) => {
      return userId.toString() !== foundUserId.toString()
    })[0]
    missingUsers[missingUserId] = missingUsers[missingUserId] ? missingUsers[missingUserId] + 1 : 1
  }
  function flagMatch(match: IMatch) {
    const userId = (match.userProfiles[0] as any)._id.toString()
    userMatches[userId] = userMatches[userId] ? userMatches[userId].concat([ match._id ]) : [ match._id ]
    discrepantMatches = discrepantMatches.concat([ match._id ])
  }
  // console.log(discrepantMatches, userMatches)
  let userMatchKeys = Object.keys(userMatches)
  console.log(`prepared to delete ${discrepantMatches.length} matches; affecting ${userMatchKeys.length} users`)

  if(!deleteResults) return
  /** This stuff deletes shit. */
  console.log('deleting matches...')
  await Match.deleteMany({ _id: { $in: discrepantMatches}})
  console.log('deleting matchIds from affected users')
  await Promise.all(userMatchKeys.map(async (userId, i, arr) => {
    return await User.updateOne({ _id: userId }, { $pullAll: { matches: userMatches[userId]}})
  }))
  console.log('user\'s matchIds and matches deleted')
}