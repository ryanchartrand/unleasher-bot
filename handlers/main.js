import { switchGoal, createGoal, achieveCurrentGoal, postponeCurrentGoal } from '../handlers/api/paths'
import { formatGoalDueDate, formatInteractiveComponent } from '../util/formatter'
import { dateNextWeekISO } from '../util/date'
import { openDialog } from '../handlers/api/slack/dialog'
import { sendResponseToMessage, sendChatMessage, sendChannelMessage } from '../handlers/api/slack/chat'
import { getUserData } from '../handlers/api/slack/user'
import interactiveComponent from '../models/interactiveComponent'
import { IM_CREATE_UNLEASH_GOAL } from '../handlers/bot/conversations/createUnleashGoal'
import { IM_START_UNLEASH } from '../handlers/bot/conversations/weeklyUnleash'
import { IM_POST_GOAL_CREATED } from '../util/formatter'

const handleGoalCreated = async (payload) => {
    const name = payload.submission.goal_name
    const description = payload.submission.goal_description
    const dueDate = formatGoalDueDate(dateNextWeekISO())
    const level = interactiveComponent.DEFAULT_GOAL_LVL
    const icon = interactiveComponent.DEFAULT_GOAL_ICON
    const achieved = false
    const goal = { name, description, dueDate, level, icon, achieved }
    const createdGoal = await createGoal(payload.user.id, goal)
    const data = { callbackId: IM_POST_GOAL_CREATED.callbackId, goalId: createdGoal.id }
    const attachments = formatInteractiveComponent(data)
    sendChatMessage(payload.user.id, payload.team.id, null, JSON.stringify(attachments))
}

const handleSwitchGoal = async (payload) => {
    const goalId = payload.actions[0].selected_options[0].value
    const userId = payload.user.id
    const goal = await switchGoal(userId, goalId)
    //res.status(200).send('Great! You can see the details of your current goal below. Talk soon. Good luck!')
    let data = goal
    data.callbackId = interactiveComponent.IM_MSG_TYPE_AFTER_GOAL_SWITCHED
    const attachments = formatInteractiveComponent(data)
    sendChatMessage(payload.user.id, payload.team.id, null, JSON.stringify(attachments))
}

// const handleSetGoalInProgress = async () => {
//     const goalId = payload.actions[0].value
//     const userId = payload.user.id
//     const goal = await switchGoal(userId, goalId)
//     res.status(200).send('Great! You can see the details of your current goal below. Talk soon. Good luck!')
//     let data = goal
//     data.callbackId = interactiveComponent.IM_MSG_TYPE_AFTER_GOAL_SWITCHED
//     const attachments = formatInteractiveComponent(data)
//     sendChatMessage(payload.user.id, payload.team.id, null, JSON.stringify(attachments))
// }

// const handleUnleashInit = async () => {
//     if (payload.actions[0].name == interactiveComponent.GENERIC_YES) {
//         openDialog(payload.team.id, payload.trigger_id)
//         res.status(200).send()
//         await sendResponseToMessage(payload.response_url, 'You selected `Create goal`. Thanks!')
//     } else if (payload.actions[0].name == interactiveComponent.GENERIC_NO) {
//         res.status(200).send({'text': interactiveComponent.MKTHX})
//     } else if (payload.actions[0].name == interactiveComponent.ACTION_CONTACT_MY_UNLEASHER) {
//         res.status(200).send('OK! Message to UNLEASHERS has been sent. Expect to hear from them shortly.')
//         await sendChannelMessage(process.env.unleashers_channel, payload.team.id, `Hi. <@${payload.user.id}> has requested unleasher.`)
//     }
// }

// const handleCreateGoal = async () => {
//     if (parseInt(payload.actions[0].value) === 1) {
//         openDialog(payload.team.id, payload.trigger_id)
//         res.status(200).send()
//         await sendResponseToMessage(payload.response_url, 'You selected `Create goal`. Thanks!')
//     } else {
//         res.status(200).send({'text': interactiveComponent.MKTHX})
//         // if this selected we can say that the bot will contact anyway next week. Might be nice to show date and time.
//     }
// }

// const handleGoalCompleted = async () => {
//     let data = await achieveCurrentGoal(payload.user.id)
//     res.status(200).send('Awesome! Congrats! :sparkles: :tada: :cake: \nWhenever you feel ready ping me in here to plan your next step.')
//     data.callbackId = interactiveComponent.ATTCH_MSG_GOAL_COMPLETED
//     data.userId = payload.user.id
//     data.userData = await getUserData(payload.user.id, payload.team.id)
//     const attachments = formatInteractiveComponent(data)
//     await sendChannelMessage(process.env.unleash_channel, payload.team.id, null, JSON.stringify(attachments))
// }

// const handleGoalPostponed = async () => {
//     await postponeCurrentGoal(payload.user.id)
//     res.status(200).send('Ok I added another week to this. I will bug you in 7 day. Stay positive!')
// }

// const handleContactUnleasher = async () => {
//     res.status(200).send('OK! Message to UNLEASHERS has been sent. Expect to hear from them shortly.')
//     await sendChannelMessage(process.env.unleashers_channel, payload.team.id, `Hi. <@${payload.user.id}> has requested unleasher.`) 
// }

const handlePostGoalCreatedChoice = async (payload) => {
    console.log(payload)
    switch (parseInt(payload.actions[0].name)) {
    case IM_POST_GOAL_CREATED.actions.createNew:
        await openDialog(payload.team.id, payload.trigger_id)
        await sendResponseToMessage(payload.response_url, 'Opening `Create Goal` dialog ...')
        break

    case IM_POST_GOAL_CREATED.actions.setInProgress:
        console.log('set in progress')
        break

    case IM_POST_GOAL_CREATED.actions.doNothing:
        console.log('do nothing')
        break

    default:
        break
    }
}

const handleSelectOrCreateGoalChoice = async (payload) => {
    switch (parseInt(payload.actions[0].name)) {
    case IM_START_UNLEASH.actions.createNew:
        await openDialog(payload.team.id, payload.trigger_id)
        await sendResponseToMessage(payload.response_url, 'Opening `Create Goal` dialog ...')
        break

    case IM_START_UNLEASH.actions.chooseExising:
        handleSwitchGoal(payload)
        break

    case IM_START_UNLEASH.actions.contactUnleasher:
        break
    
    case IM_START_UNLEASH.actions.doNothing:
        break

    default:
        console.log('Unsupported action name: ', payload.actions[0].name)
        break
    }
}

const handleCreateUnleashGoalChoice = async (payload) => {
    switch (parseInt(payload.actions[0].name)) {
    case IM_CREATE_UNLEASH_GOAL.actions.createGoal:
        await openDialog(payload.team.id, payload.trigger_id)
        await sendResponseToMessage(payload.response_url, 'Opening `Create Goal` dialog ...')
        break

    case IM_CREATE_UNLEASH_GOAL.actions.contactUnleasher:
        break

    case IM_CREATE_UNLEASH_GOAL.actions.doNothing:
        break

    default:
        console.log('Unsupported action name: ', payload.actions[0].name)
        break
    }
}

export {
    handleCreateUnleashGoalChoice,
    handleGoalCreated,
    handleSelectOrCreateGoalChoice,
    handlePostGoalCreatedChoice,
}