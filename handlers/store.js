import firebase from 'firebase'
import * as slackApi from './api/slackApi'

const TOKENS = 'tokens'

const config = {
  apiKey: process.env.firebase_config_apikey,
  authDomain: process.env.firebase_config_authdomain,
  databaseURL: process.env.firebase_config_databaseurl,
  storageBucket: process.env.firebase_config_storagebucket,
  messagingSenderId: process.env.firebase_config_messagingsenderid,
  projectId: process.env.firebase_config_projectid
}

const init = () => {
  try {
    firebase.initializeApp(config)
    firebase.auth().signInAnonymously()
  } catch (e) {
    console.log('Firebase auth error', e)
  }
}

const storeTeamToken = (token) => {
  const botData = { botToken: token.bot.bot_access_token, botUserId: token.bot.bot_user_id }
  const data = { teamId: token.team_id, bot: botData, token: token.access_token }
  const ref = `${TOKENS}/${token.team_id}`
  firebase.database().ref(ref).set(data)
}

const setupDevTeam = async function() {
  let devBotData = await slackApi.identifyDevBotData()
  const botData = { bot_access_token: process.env.slack_bot_token, bot_user_id: devBotData.user_id}
  const tokenData = { bot: botData, team_id: devBotData.team_id, access_token: process.env.slack_api_token}
  storeTeamToken(tokenData)
}

const getAllTokens = () => {
  return new Promise((resolve, reject) => {
    const teamsTokens = firebase.database().ref(TOKENS)
      teamsTokens.once('value', (snapshot) => {
        let tokens = []
        const snaps = snapshot.val()
        for (var key in snaps) {
          if (snaps.hasOwnProperty(key)) {
            tokens.push({ token: snaps[key].bot.botToken, team: key })
          }
        }
        resolve(tokens)
    })
  })
}

export {
  storeTeamToken,
  setupDevTeam,
  getAllTokens,
  init,
}
