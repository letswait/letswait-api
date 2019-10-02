import { User, Match } from '../../schemas'
import * as mongoose from 'mongoose'
import { Socket } from 'socket.io';

import { IMessage, Reaction, IChat } from '../../types/match'
import { createWheel } from '../../modules/get-wheel';
import { IMatchModel } from '../../schemas/match';

const socketRouter = (socket: Socket) => {
  if(!socket.request.session || !socket.request.session.passport) return 
  let userId = socket.request.session.passport.user;

  /**
   * CHAT SOCKETS
   * @method joinchat
   * @method message
   * @method messagePhoto
   * @method messageRead
   * @method reaction
   */
  socket.on('joinchat', async (matchId: string) => {
    const match = await Match.findOne({ _id: matchId, userProfiles: userId })
    if(match) {
      socket.join(matchId, () => {
        socket.to(matchId).emit('userJoined', userId.toString())
      })
    }
  })

  socket.on('message', async (data: string, cb: (data: IChat) => void) => {
    try {
      const { matchId, message, messageId }:
        { matchId: mongoose.Types.ObjectId, message: IMessage, messageId: string } = JSON.parse(decodeURIComponent(data))
      const newMessage: IChat = {
        _id: messageId,
        sentTimestamp: new Date(),
        user: userId,
        message: message,
        reactions: new Map()
      }
      // Send to all Available Clients in room, except sender
      socket.broadcast.to(matchId.toString()).emit('messageSent', { matchId: matchId, message: newMessage })
      const match = await Match.findOneAndUpdate(
        { _id: matchId, userProfiles: userId },
        { $addToSet: { chat: newMessage } },
        { new: true }
      )
      /**
       * @todo chance of collision is small, however there should still be an error
       *       check that recreates a random interger and tells the client how to remap it.
       */
      if(match) {
        cb(newMessage)
      } else {
        throw 'couldn\'t send chat'
      }
    } catch(e) {
      cb(null)
    }
  })

  socket.on('messageRead', (roomId: string, messageId: string) => {

  })

  socket.on('reaction', (roomId: string, messageId: string, reaction: Reaction) => {

  })

  /**
   * MATCH SOCKETS
   * @method denyMatch - Finds Match, suspends it, and removes it from both users.
   * @method acceptMatch - Finds Match, accepts it, and forces it into the other user's feed...
   *                       Or... on Match, sends back successful match callback.
   * @method
   */
  socket.on('acceptMatch', async (matchId: mongoose.Types.ObjectId, cb: (data: {
    matchId?: mongoose.Types.ObjectId
    accepted?: true // This Callback should only be sent back if accepted or spinner has been generated, client discerns on their end.
    preloadedDate?: 'sponsored' | 'event' | 'premiumMatch' | 'recommendation'
    preloadedSource?: string
    preloadedSpinner?: string

    match?: IMatchModel
    wheel?: any // When got spinner data, send it down. client should catch it and incorporate it into match
  }) => void) => {
    try {
      const match = await Match.findById(
        { _id: matchId, [`userProfiles.${userId}`]: { $exists: true },
      })
      const users = Object.keys(match.users)
      let candidate;
      let user;
      console.log('are they equal?', users[0] === userId.toString(), userId, users[0])
      if(users[0] === userId.toString()) {
        candidate = [users[1], match.users[users[1]]]
        user = [users[0], match.users[users[0]]]
      } else {
        candidate = [users[0], match.users[users[0]]]
        user = [users[1], match.users[users[1]]]
      }
      match.users[user[0]] = 'accepted'
      if(candidate[1] === 'rejected') return // They were rejected since they got the match.
      if(candidate[1] === 'queued') { // No Response from other yet, we will send a push notification and note the change
        User.findOneAndUpdate(
          {
            _id: candidate[0],
            [`matches.${match._id}`]: { $exists: false },
          }, {
            $pushToSet: {
              matches: match._id
            }
          }, {
            new: true,
          },
          (err, res) => console.log('Accept Queued FindOneAndUpdate', err, res))
        match.state = 'queued'
        updateMatch()
      } 
      if(candidate[1] === 'accepted') { // Its a Match!, let them know, then create a spinner to send down, push notify candidate too
        // const res = {
        //   accepted: true,
        // }
        // if(match.dates[0]) {
        //   res.preloadedDate =
        // }
        
        cb({ matchId: candidate[0], accepted: true }) // send it back
        
        const matchProfile = await User.findById(candidate[0], 'name birth age profile isBot botBehavior').lean()

        match.state = 'matched'

        // Get Wheel
        const wheel = await createWheel(match, userId, matchProfile)

        // Transform response objects
        const resMatch = match.toJSON()
        resMatch.userProfiles = [matchProfile]
        cb({ match: resMatch, wheel, accepted: true })
        updateMatch()
      }
      function updateMatch() {
        Match.updateOne({ _id: matchId }, match, (err, raw) => {
          if(!err) {
            // sidewalk.success('Updated Match!')
          }
        })
      }
    } catch (e) {
      console.log('socket error, couldn\'t match user')
    }
  })
  
  socket.on('rejectMatch', async (matchId: mongoose.Types.ObjectId) => {
    const match = await Match.findById(
      { _id: matchId, [`userProfiles.${userId}`]: { $exists: true },
    })
    const users = Object.keys(match.users)
    let candidate;
    let user;
    console.log('are they equal?', users[0] === userId.toString(), userId, users[0])
    if(users[0] === userId.toString()) {
      candidate = [users[1], match.users[users[1]]]
      user = [users[0], match.users[users[0]]]
    } else {
      candidate = [users[0], match.users[users[0]]]
      user = [users[1], match.users[users[1]]]
    }
    match.users[user[0]] = 'rejected'
    match.state = 'suspend'
    User.findOneAndUpdate(
      {
        _id: candidate[0],
        [`matches.${match._id}`]: { $exists: false },
      }, {
        $pull: {
          matches: match._id
        }
      }, {
        new: true,
      },
      (err, res) => console.log('Reject FindOneAndUpdate', err, res))
  })
}
export default socketRouter