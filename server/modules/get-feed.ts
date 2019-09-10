import { User, Match } from '../schemas'
import { IMatchModel } from '../schemas/match';

import * as mongoose from 'mongoose'
import { IUser } from '../schemas/user';

import createBot from '../library/createBot'

export default async function (req, res) {
  // Get Queued Matches
  // console.log('Getting Feed')
  const user = await User.findOne({ _id: req.user._id }).populate({
    path: 'matches',
    match: { state: 'queued' },
    options: { lean: true },
  })
  if (!user || !user.lastLocation) {
    // console.log('user not found ', user)
    res.status(500).send()
  } else {
    let feed: any = []

    // console.log('feed assembly started')

    // Filter out swiped matches by userId state 
    if (user.matches && user.matches.length) feed = [...user.matches.filter((match, i, arr) => {
      if (typeof match !== 'string') {
        return (match as IMatchModel).users[user._id] === 'queued'
      }
      return false
    })]

    // console.log(' filtered out swiped matches')

    // Generate New Feed Matches
    if (feed.length <= 10) {
      // console.log('not enough matches available, generating more...')
      // Get All User Matches
      const userWithMatches = await User.findOne({ '_id': req.user._id }, 'matches').populate({
        path: 'matches',
        options: { lean: true },
      }).lean()
      const matchRestrictor = [req.user._id, ...userWithMatches.matches.map((match, i, arr) => {
        const ids = (match as any).users instanceof Map ?
          Array.from((match as any).users.keys()) :
          Object.keys((match as any).users)
        // Discern Candidate ID and convert it to string to properly compare
        const id = ids[0] === user._id.toString() ? ids[1] : ids[0]
        // Convert Result to ObjectID
        return mongoose.Types.ObjectId(id as string)
      })]

      // Aggregate Candidates
      let newMatchCandidates = await User.find({
        '_id': { $nin: matchRestrictor },
        'name': { $exists: true },
      }).limit(40)

      let newBotAccounts: IUser[] = []
      // Create New Bot Users Around User if less than 40 users pulled. make up difference
      if (40 - newMatchCandidates.length) {

        let newBots: IUser[] = []
        for (let i = 40 - newMatchCandidates.length; i--;) {
          newBots = newBots.concat([await createBot(user)])
        }
        newBotAccounts = await User.insertMany(newBots)
      }

      newMatchCandidates = [...newBotAccounts, ...newMatchCandidates]
      // Create Matches
      const createdMatches = newMatchCandidates.map((candidate, i, arr) => {
        return {
          users: {
            [user._id]: 'queued',
            [candidate._id]: candidate.isBot ? candidate.botBehavior.swipesRight ?
              'accepted' :
              'queued' :
              'queued'
          },
          userProfiles: [user._id, candidate._id]
        }
      })
      const newMatches = await Match.insertMany(createdMatches)

      // If New Matches Successfully Created, Add to user feed and update user
      if (newMatches && newMatches.length) {
        feed = [...feed, ...newMatches]
        const userMatches: string[] = newMatches.map((match, i, arr) => {
          if (newBotAccounts.length) {
            const candidateId = match.userProfiles[0] === req.user._id ?
              match.userProfiles[1] :
              match.userProfiles[0]
            for (let i = newBotAccounts.length; i--;) {
              const bot = newBotAccounts[i]
              if (bot._id === candidateId && bot.isBot && bot.botBehavior.swipesRight) {
                User.updateOne({ _id: bot._id }, { $push: { matches: match._id } }).exec((err, res) => {
                  if (err) console.log('couldnt update new bot with match')
                })
              }
            }
          }
          return match._id
        })
        await User.updateOne({ _id: req.user._id }, { $push: { matches: userMatches } })
      }
    }

    const matchMap: any = {}
    // Map User Array from feed
    const userIds = feed.map((match, i, arr) => {
      const idKeys = match.users instanceof Map ?
        Array.from(match.users.keys()) :
        Object.keys(match.users)
      const userId = idKeys[0] === req.user._id ? idKeys[0] : idKeys[1]
      matchMap[userId.toString()] = match._id.toString()
      return userId
    })

    // console.log('match map made, fetching users...')

    // Collect User Profiles
    const userProfiles = await User.find(
      { "_id": { $in: userIds } },
      `
        name
        birth
        age
        profile
        isBot
        botBehavior
      `
    )

    // console.log('deleting births')
    /**
     * @todo Not Including properties by virtuals results in the virtual itself being undefined 
     */
    for (let i = userProfiles.length; i--;) {
      delete userProfiles[i].birth
    }

    //Serve to client
    // console.log('serving to client', matchMap)
    res.status(200).send({
      matchMap,
      feed: userProfiles,
    })
    // Identify User
    // Build Search Query
    // - Origin (Bounded: [-90 < n < 90, -180 < n < 180])
    // - Search Distance (Bounded: [10 < n < 100])
    // - Sort Terms As Filters: Food, Occupation, Education Level, Religion, Height, 
    // Query Users
    // Sort By Items
    // - Food Matches
    // - (if has at least 50 swipes) Swipe Fitness Closeness, Biased towards slightly above swipe fitness
    // - Future?: Occupation Matches, Like professions or "compatible" occupations. results are more or less important depending on commitment level
    // - Education Matches
    // - Similar Term usage in like Q&A

    // Sorting:::
    //    Parse Profile Information into numerical values
    //    Find furthest values above and below User's values
    //    Aggregate Scores
    //    Sort List By Raw Closeness Value 0-1
    //    Displace Certain Percentiles Programmatically
    //      - Random Top 10 candidate selected to be at front 1-3 of queue for session
    //      - top 10% randomly spread throughout bottom 10-40%
    //      - half of top 10-20% randomly spread throughout bottom 20-70%
    //      - every third top 20-30% randomly spread throughout 30-100%
    // Save Stack
    // send 5 with edge number
  }
}
