import React, { useState } from 'react'
import moment from 'moment'
import Compose from '../Compose'
// import Toolbar from '../Toolbar'
import ToolbarButton from '../ToolbarButton'
import Message from '../Message'
import './index.css'
import {connect} from 'react-redux'
import * as actions from '../../actions'
import { joinGroup, registerMessage, sendMessage } from '../../chat'


const MY_USER_ID = 'apple'

function MessageList(props) {
  const [messages, setMessages] = useState([])


  // const updateMessage = (msg) => {
  //   setMessages([{
  //     id: 1,
  //     author: msg.username,
  //     message: msg.text,
  //     timestamp: msg.createdAt
  //   }, ...messages])
  // }

  console.log('MsgList', props.auth)

  props.auth.isAuth && joinGroup({ username: props.auth.name, room: 'test' })

  const onMyMessageSend = (message) => {
    console.log('send msg', message)
    sendMessage(message, () => {
      setMessages([...messages, {
        author: MY_USER_ID,
        timestamp: new Date().getTime(),
        message
      }])
    })
  }

  const updateReceivedMessage = (msg) => {
    console.log('rec Msg', msg)
    setMessages([...messages, {
      id: 1,
      author: msg.username,
      message: msg.text,
      timestamp: msg.createdAt
    }])
  }

  registerMessage(updateReceivedMessage)

  // useEffect(() => {
  //   getMessages()
  // }, [])

  const renderMessages = () => {
    let i = 0
    const messageCount = messages.length
    const tempMessages = []

    while (i < messageCount) {
      const previous = messages[i - 1]
      const current = messages[i]
      const next = messages[i + 1]
      const isMine = current.author === MY_USER_ID
      const currentMoment = moment(current.timestamp)
      let prevBySameAuthor = false
      let nextBySameAuthor = false
      let startsSequence = true
      let endsSequence = true
      let showTimestamp = true

      if (previous) {
        const previousMoment = moment(previous.timestamp)
        const previousDuration = moment.duration(currentMoment.diff(previousMoment))
        prevBySameAuthor = previous.author === current.author

        if (prevBySameAuthor && previousDuration.as('hours') < 1) {
          startsSequence = false
        }

        if (previousDuration.as('hours') < 1) {
          showTimestamp = false
        }
      }

      if (next) {
        const nextMoment = moment(next.timestamp)
        const nextDuration = moment.duration(nextMoment.diff(currentMoment))
        nextBySameAuthor = next.author === current.author

        if (nextBySameAuthor && nextDuration.as('hours') < 1) {
          endsSequence = false
        }
      }

      tempMessages.push(
        <Message
          key={i}
          isMine={isMine}
          startsSequence={startsSequence}
          endsSequence={endsSequence}
          showTimestamp={showTimestamp}
          data={current}
        />
      )

      // Proceed to the next message.
      i += 1
    }

    return tempMessages
  }

  /*  return (
    <div className="message-list">
      <Toolbar
        title="Conversation Title"
        rightItems={[
          <ToolbarButton key="info" icon="ion-ios-information-circle-outline" />,
          <ToolbarButton key="video" icon="ion-ios-videocam" />,
          <ToolbarButton key="phone" icon="ion-ios-call" />
        ]}
      />

      <div className="message-list-container">{renderMessages()}</div>

      <Compose rightItems={[
        <ToolbarButton key="photo" icon="ion-ios-camera" />,
        <ToolbarButton key="image" icon="ion-ios-image" />,
        <ToolbarButton key="audio" icon="ion-ios-mic" />,
        <ToolbarButton key="money" icon="ion-ios-card" />,
        <ToolbarButton key="games" icon="ion-logo-game-controller-b" />,
        <ToolbarButton key="emoji" icon="ion-ios-happy" />
      ]}
      />
    </div>
  )
  */
  return (
    <div className="message-list">
      <div className="message-list-container">{renderMessages()}</div>
      <Compose
        onMessageSend={onMyMessageSend}
        rightItems={[
          <ToolbarButton key="image" icon="ion-ios-image" />,
          <ToolbarButton key="emoji" icon="ion-ios-happy" />
        ]}
      />
    </div>)
}


const mapStateToProps = state => ({
  auth: state.auth,
})

export default connect(mapStateToProps, actions)(MessageList)
