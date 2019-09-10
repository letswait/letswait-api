import { User, Match } from '../schemas'
import moment = require('moment')
import { IMatchModel } from 'Schemas/match'
import sidewalk from '../library/sidewalk'

async function getMatches(req, res) {
  // Get Matches
  // sidewalk.emphasize('getting matches')
  const matches = await Match.find({'_id': { $in: req.user.matches }}).populate({
    path: 'userProfiles',
    select: `
      name
      birth
      age
      profile
      isBot
      botBehavior
    `,
    match: { _id: { $ne: req.user._id }},
    options: { lean: true }
  }).lean()

  try {
    // Find Matches where candidates are awaiting acceptance
    const enqueuedMatches = matches.filter((match, i, arr) => {
      const userIds = Object.keys(match.users)
      const candidateId = userIds[0] === req.user._id.toString() ? userIds[1] : userIds[0]
      const candidateState = match.users[candidateId]
      return match.state === 'queued' && candidateState === 'accepted'
    })
    // Find all Matched matches
    const matchedMatches = matches.filter((match, i, arr) => match.state === 'matched')
    // Filter out all matches where chat.length === 0
    let uninitializedMatches = []
    let chatMatches = []
    for(let i = matchedMatches.length; i--;) {
      // Collect Match
      const match = matchedMatches[i]
      // Concat to Chat Matches if Chat was initialized
      if(match.chat.length) {
        chatMatches = chatMatches.concat([
          match
        ])
      } else {
        // Otherwise, throw into Uninitialized Matches
        uninitializedMatches = uninitializedMatches.concat([
          match
        ])
      }
    }
    // Pass it Back
    const result = {
      enqueuedMatches: (enqueuedMatches as any[]).sort((a, b) => b.timestamp - a.timestamp),
      uninitializedMatches: (uninitializedMatches as any[]).sort((a, b) => b.timestamp - a.timestamp),
      chatMatches: (chatMatches as any[]).sort((a, b) => b.timestamp - a.timestamp),
      message: null,
    }
    res.status(200).send(result)
  } catch(e) {
    const err = 'Could not Load Matches' || e
    res.status(200).send({
      enqueuedMatches: [],
      uninitializedMatches: [],
      chatMatches: [],
      message: err,
    })
  }
}
export default getMatches