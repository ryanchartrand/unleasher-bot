import Botkit from 'botkit'
import { startUnleashConvo } from './bot/conversations/startUnleash'
import { startIntroductionConvo } from './bot/conversations/introduction'
import { startWeeklyConvo } from './bot/conversations/weeklyUnleash'
import { getCurrentGoal } from './api/paths'
import { getTeamUsers } from './api/slack'
import { isUserInWhitelist } from './store'

let bots = []
let users = []

const listener = Botkit.slackbot({
  debug: false,
  stats_optout: false
})

const createNewBotConnection = (token) => {
  const bot = listener.spawn({ token: token.token }).startRTM()
  bots[token.team] = bot
  users[token.team] = getTeamUsers(token.token)
}

const resumeAllConnections = (tokens) => {
  for ( const key in tokens ) {
    createNewBotConnection(tokens[key])
  }
}

const hiBack = (bot, message) => {
  bot.startPrivateConversation(message, (err, convo) => startUnleashConvo(bot, message, convo))
}

const introduceUnleash = (bot, message) => {
  bot.startConversation(message, (err, convo) => startIntroductionConvo(convo))
}

const weeklyStatusUpdate = () => {
  for ( const team in bots ) {
    users[team].then((teamUsers) => {
      teamUsers.forEach((user) => {
        if (isUserInWhitelist(user.name)) {
          let message = {user: user.id}
          bots[team].startPrivateConversation(message, (err, convo) => startUnleashConvo(bots[team], message, convo))
        }
      })
    })
  }
}

export {
  listener,
  createNewBotConnection,
  resumeAllConnections,
  hiBack,
  introduceUnleash,
  weeklyStatusUpdate
}
