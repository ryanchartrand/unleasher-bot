import * as dateUtil from '../../../util/date'
import { goalsToOptions } from '../../../util/formatter'
import { listUnachievedAndIdleGoals, getCurrentGoal } from '../../api/paths'
import {
  addMessageAskCreateGoal,
  addMessageAskName,
  addMessageAskDescription,
  addMessageGoalCreated
} from './createUnleashGoal'
import {
  addMessageAskGoalCompletion,
  addMessageAskMoreTime,
  addMessageAskChooseGoal,
  addMessageAskMaybeCreateGoal,
} from './weeklyUnleash'

export const startUnleashConvo = async function(bot, response, convo) {
  const userId = response.user
  const goals = await listUnachievedAndIdleGoals(userId)
  const goal = await getCurrentGoal(userId)

  addMessagePresentGoals(convo, response, goals)
  addMessageBye(convo)
  addMessageAskCreateGoal(convo, bot)
  addMessageAskName(convo, response, goal)
  addMessageAskDescription(convo, bot, response)
  addMessageGoalCreated(convo)
  addMessageAskChooseGoal(convo, bot)
  addMessageAskMaybeCreateGoal(convo, bot)
  if (goal) {
    addMessageAskGoalCompletion(convo, bot, goal)
    addMessageAskMoreTime(convo, bot, goal, goals)
  }
  convo.activate()

  if (goal) {
    convo.gotoThread('weeklyUnleash_askGoalCompletion')
  } else if (goals.length) {
    convo.gotoThread('weeklyUnleash_askChooseGoal')
  } else {
    convo.gotoThread('createUnleashGoal_askCreateGoal')
  }
}

const addMessagePresentGoals = async function(convo, response, goals) {
  const dropdownOptions = goalsToOptions(goals)
  convo.addMessage({
      text: 'Alright! Lets select goal you\'d like to focus on this week:',
      response_type: 'in_channel',
      attachments: [
        {
          'fallback': 'Select goal',
          'color': '#3AA3E3',
          'attachment_type': 'default',
          'callback_id': 'select_existing_goal',
          'actions': [
            {
              'name': 'goals_list',
              'text': 'Select goal',
              'type': 'select',
              'options': dropdownOptions,
            },
            {
              'name': 'no',
              'text': 'Not today ...',
              'value': 1,
              'type': 'button',
            }
          ]
        }
      ]
    },
    'startUnleash_presentGoals'
  )
}

const addMessageBye = (convo) => {
  convo.addMessage({
      text: 'Alright, let\'s try some other time :wave:',
    },
    'bye'
  )
}
