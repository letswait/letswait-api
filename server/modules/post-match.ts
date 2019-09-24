import { User, Match } from '../schemas'
import moment = require('moment')
import { MatchState } from '../types/match'
import { createWheel } from './get-wheel';
import sidewalk from '../library/sidewalk';

export default async function(req, res) {
  try {
    // Get Match, find Users
    const { matchId, action } = req.body
    const match = await Match.findOne({ _id: matchId })
    const userKeys = Array.from(match.users.keys())
    const userId = req.user._id.toString()
    const candidateId = userKeys[0] === userId ? userKeys[1] : userKeys[0]
    const candidateAction = match.users.get(candidateId)

    // Set User Action
    match.users.set(userId, action)

    // Accepted Action
    if(action === 'accepted') {
      if(candidateAction === 'accepted') {
        // Switch match to matched
        match.state = 'matched'
        updateMatch()
        // const wheel = await createWheel(match, req.user._id)
        res.status(200).send({
          match,
          continue: false,
          // wheel
        })
      } else if(candidateAction === 'queued') {
        // Switch to Queued in case it was a backtrace + swipe right
        // Takes it out of 'suspend' designation
        const candidate = await User.findById(candidateId)
        // const matchState = await candidate.hasMatchWith(userId)
        // if(!matchState) {
        //   //Match Does Not Exist. Create Reference
        //   await User.updateOne({ _id: candidateId }, { $push: { matches: match._id }})
        // }
        match.state = 'queued'
        updateMatch()
        // SNS Notify Candidate
        // Push Onto Match Queue of Candidate User
        throw true
      } else {
        throw true
      }
    } else if(action === 'rejected') {
      // OnReject, silently suspend and throw
      match.state === 'suspend'
      updateMatch()
      throw true
    } else {
      // Something is Wrong, it shouldnt reach this.
      throw undefined
    }

    // Update Match
    function updateMatch() {
      Match.updateOne({ _id: matchId }, match, (err, raw) => {
        if(!err) {
          // sidewalk.success('Updated Match!')
        }
      })
    }
  } catch(e) {
    // Expect Error to come in as either undefined or { message: string, action: string } or true
    res.status(e ? 200 : 500).send({
      continue: true,
      ...(e.action && e.message ? {
        action: e.action,
        message: e.message
      } : null)
    })
  }
}
  // const { matchId, action } = req.body
  // const match = await Match.findById(matchId)
  // if(match && match._id) {
  //   // Match Exists, get user indices
  //   let [u, c] = match.users[0].userId === req.user._id ? [0, 1] : [1, 0]
  //   match.users[u].state = action
  //   // States of Matches
  //   let doc = {
  //     [`match.users.${u}.state`]: action,
  //     state: match.state
  //   }
  //   let returnedBody: any = { continue: true }
  //   if(action === 'accepted') {
  //     if(match.users[c].state === 'accepted') {
  //       // Change State to matched
  //       doc.state = 'matched' 
  //       // Create Spin Wheel Data

  //       // Accept Res, Push Spin Wheel data
  //       returnedBody.wheel = createWheel(match)
  //       returnedBody.matchId = match._id
  //       returnedBody.continue = false
  //       res.status(200).send(returnedBody)
  //     } else if(match.users[c].state === 'queued') {
  //       // Change State to Queued (covers backtracks)
  //       doc.state = 'queued'
  //       // SNS Notify candidate of potential match (if hasnt been notified in 30 minutes?)
  //       // Silently Accept Res
  //       res.status(200).send({ continue: true })
  //     }
  //   } else if(action === 'rejected') {
  //     // Change State to Suspend
  //     doc.state = 'suspend'
  //     // Silenly Accept Res
  //     res.status(200).send({ continue: true })
  //   }
  // }
// }