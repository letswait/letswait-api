import { User, Match } from '../../schemas'
import * as mongoose from 'mongoose'
import { Socket } from 'socket.io';

import { IMessage, Reaction, IChat } from '../../types/match'
import { createWheel } from '../../modules/get-wheel';
import { IMatchModel } from '../../schemas/match';

import { getFeed } from '../../modules/get-feed'
import { IUser } from 'Schemas/user';

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

  socket.on('message', async (data: any, cb: (data: string) => void) => {
    try {
      const { matchId, message, messageId }:
        { matchId: mongoose.Types.ObjectId, message: IMessage, messageId: string } = _decode(data)
      const newMessage: IChat = {
        _id: messageId,
        sentTimestamp: new Date(),
        user: userId,
        message: message,
        reactions: new Map()
      }
      // Send to all Available Clients in room, except sender
      socket.broadcast.to(matchId.toString()).emit('messageSent', _encode({ matchId: matchId, message: newMessage }))
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
        cb(_encode(newMessage))
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
 * FEED SOCKETS
 * @method
 */
socket.on('requestFeed', async (data: {
  sexualPreference: 'men' | 'women' | 'everyone'
  radius: number,
  ageRange: [number, number],
  goal: 'exclusive' | 'unsure' | 'casual' | 'serious',
  // tags: {

  // },
}, cb: (data: string | null) => void) => {
  const feed = await getFeed(userId)
  if(feed) {
    cb(_encode(feed))
  } else {
    cb(null)
  }
})

  /**
   * MATCH SOCKETS
   * @method denyMatch - Finds Match, suspends it, and removes it from both users.
   * @method acceptMatch - Finds Match, accepts it, and forces it into the other user's feed...
   *                       Or... on Match, sends back successful match callback.
   * @method
   */
  socket.on('acceptMatch', async (_suitorId: mongoose.Types.ObjectId, cb: (data: string) => void) => {
    try {
      const suitorId = _decode(_suitorId)
      const match = await Match.findOne({
        [`users.${userId}`]: { $exists: true }, // Checks for exact match while allowing userProfiles to just return suitor's profile
        [`userProfiles.${suitorId}`]: { $exists: true },
      })
      const users = Object.keys(match.users)
      let candidate;
      let user;
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
      if(candidate[1] === 'accepted') { // Its a Match!, let them know, then create a spinner to send down, push notify candidate to
        cb(_encode({ matchId: candidate[0] })) // send back the successful matchID
        
        const matchProfile = await User.findById(candidate[0], 'name birth age profile isBot botBehavior').lean()

        match.state = 'matched'

        // Get Wheel
        const wheel = await createWheel(match, userId, matchProfile)

        // Transform response objects
        const resMatch = match.toJSON()
        resMatch.userProfiles = [matchProfile]
        cb(_encode({ match: resMatch, wheel }))
        updateMatch()
      }
      function updateMatch() {
        Match.updateOne({ _id: match._id }, match, (err, raw) => {
          if(!err) {
            // sidewalk.success('Updated Match!')
          }
        })
      }
    } catch (e) {
      console.log('socket error, couldn\'t match user')
    }
  })
  
  socket.on('denyMatch', async (_suitorId: mongoose.Types.ObjectId) => {
    const suitorId = _decode(_suitorId)
    console.log(suitorId, userId)
    const match = await Match.findOne({
      [`users.${userId.toString()}`]: { $exists: true }, // Checks for exact match while allowing userProfiles to just return suitor's profile
      userProfiles: suitorId,
    })
    console.log('pain point? does match.users return with only one item?: ', match)
    const users = Object.keys(match.users)
    let candidate;
    let user;
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
        [`matches.${match._id.toString()}`]: { $exists: false },
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

function _decode(data: any) { return JSON.parse(decodeURIComponent(data)) }
function _encode(data: any) { return encodeURIComponent(JSON.stringify(data)) }
