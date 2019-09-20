import { Match, User, Venue } from '../schemas'
import moment = require('moment')
import { Point } from '../types'
import { IMatchModel } from 'Schemas/match'

interface messageRequest {
  text: string
  images?: [string]
  cloudfrontUri?: string
  location: Point
}
export default async function(req, res) {
  const { matchId, message } = req.body
  if(!matchId || !message) res.status(500).send()
  if(message.location && await postLocation(matchId, req.user._id, message)) {
    res.status(200).send({
      success: true
    })
  } else if(message.images && await postImages(matchId, req.user._id, message)) {
    res.status(200).send({
      success: true
    })
  } else if(message.cloudfrontUri && await postVideo(matchId, req.user._id, message)) {
    res.status(200).send({
      success: true
    })
  } else if(message.text && await postText(matchId, req.user._id, message.text)) {
    // Posted Text Message SNS alert other user and send back success
    // SNS
    res.status(200).send({
      success: true
    })
  }
  res.status(500).send()
}

export async function postLocation(matchId, user, message): Promise<IMatchModel | undefined> {
  return Match.findOneAndUpdate(
    { _id: matchId },
    { $push: { chat: {
      user,
      message: {
        text: message.text || '',
        location: message.location,
      }
    }}},
    { new: true },
  ).lean().exec()
}
export async function postText(matchId, user, message) {
  const match = await Match.findByIdAndUpdate(
    matchId,
    { $push: { chat: {
      user,
      message: {
        text: message.text || '',
        location: message.location,
      }
    }}},
    { new: true },
  )
  if(match) return true
  return false
}
export async function postImages(matchId, user, message) {
  const match = await Match.findByIdAndUpdate(
    matchId,
    { $push: { chat: {
      user,
      message: {
        text: message.text || '',
        images: message.images,
      }
    }}},
    { new: true },
  )
  if(match) return true
  return false
}
export async function postVideo(matchId, user, message) {
  const match = await Match.findByIdAndUpdate(
    matchId,
    { $push: { chat: {
      user,
      message: {
        text: message.text || '',
        cloudfront: message.cloudfrontUri
      }
    }}},
    { new: true },
  )
  if(match) return true
  return false
}
