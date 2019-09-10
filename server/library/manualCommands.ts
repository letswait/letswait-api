import { User, Venue, Match } from '../schemas'

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
