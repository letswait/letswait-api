import { Match, User, Venue } from '../schemas'
import moment = require('moment')

import sidewalk from '../library/sidewalk'

import { IWheel } from '../types/index'
import { postLocation } from './post-chat';

export default function (req, res) {
  const { wheel, message, matchId }:
    { wheel: IWheel, message: string | undefined, matchId: string} = req.body
  if(!matchId) res.status(500).send()
  const msg = message && message.length ? message : ''
  const segment = wheel.segments[wheel.chosenSegment]
  if(!segment.campaignId || !segment.venueId) res.status(500).send()
  // Verify Venue / Campaign exists
  Venue.findOne({
    "_id": segment.venueId,
  }, (err, venue) => {
    if(err || !venue) res.status(500).send()
    Match.findById(matchId, async (er, match) => {
      if(er || !match) res.status(500).send()
      match.dates = match.dates.concat([{
        venue: venue._id,
        logo: venue.logo,
        name: venue.name,
        campaignId: segment.campaignId,
        location: venue.location,
        expiresOn: moment().add(7, 'days').toDate(),
        code: segment.code,
        consumed: false,
      }])
      await Match.findOneAndUpdate({ _id: match._id }, match)
      const didPostChat = await postLocation(match._id, req.user._id, {
        text: msg,
        location: venue.location,
      })
      console.log(didPostChat, 'should redirect to chat screen', `app/chat/${match._id.toString()}`)
      if(didPostChat) res.status(200).send({ matchId: match._id })
      else {
        res.staus(500).send()
      }
    })
  })

}
