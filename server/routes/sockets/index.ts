import { User, Match } from '../../schemas'
import * as mongoose from 'mongoose'
import { Socket } from 'socket.io';

import { IMessage, Reaction, IChat } from '../../types/match'

const socketRouter = (socket: Socket) => {
  if(!socket.request.session || !socket.request.session.passport) return 
  let userId = socket.request.session.passport.user;
  socket.on('joinchat', async (matchId: string) => {
    const match = await Match.findOne({ _id: matchId, userProfiles: userId })
    if(match) {
      socket.join(matchId, () => {
        socket.to(matchId).emit('userJoined', userId.toString())
      })
    }
  })

  socket.on('message', async (data: { matchId: string, message: IMessage}, cb: (data: IChat) => void) => {
    const newChat: IChat = {
      sentTimestamp: new Date(),
      user: userId,
      message: data.message,
      reactions: new Map()
    }
    // Send to all Available Clients in room, except sender
    socket.broadcast.to(data.matchId).emit('messageSent', { matchId: data.matchId, chat: newChat })
    const match = await Match.findOneAndUpdate(
      { _id: data.matchId, userProfiles: userId },
      { $push: { chat: newChat } },
      { new: true }
    )
    if(match) {
      cb(newChat)
    } else {
      cb(null)
    }
  })

  socket.on('messageRead', (roomId: string, messageId: string) => {

  })

  socket.on('reaction', (roomId: string, messageId: string, reaction: Reaction) => {

  })
}
export default socketRouter