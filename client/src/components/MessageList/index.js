import React, { Component } from 'react'
import moment from 'moment'
import { connect } from 'react-redux'
import Compose from '../Compose'
// import Toolbar from '../Toolbar'
import ToolbarButton from '../ToolbarButton'
import Message from '../Message'
import './index.css'
import * as actions from '../../actions'
import {
  joinGroup, registerMessage, sendMessage, registerRoomData, disJoinGroup
} from '../../chat'


class MessageList extends Component {
  constructor(props) {
    super(props)
    this.state = {
      messages: [],
      showAllMessages: false
    }
  }

  setMessages = (messages = []) => {
    this.setState({
      messages
    })
  }


  componentDidMount() {
    // Join the group and register to socket events
    joinGroup({
      username: this.props.auth.name,
      room: this.props.chat.room
    }, () => {
      this.setState({
        showAllMessages: true
      })
    })

    registerMessage((msg) => {
      // update the received msg
      const {messages} = this.state
      this.setMessages([...messages, msg])
    })

    registerRoomData((roomData) => {
      try {
        const rawChatLog = roomData.chatLogs
        const jsonStr = `[${rawChatLog.slice(0, -1)}]`
        const jsonChatArr = JSON.parse(jsonStr)
        this.setMessages(jsonChatArr)
      } catch (e) {
        console.log('Chat log parsing issue', e)
      }
    })
  }

  onMyMessageSend = (text) => {
    const {messages} = this.state
    const username = this.props.auth.name
    sendMessage(text, () => {
      this.setMessages([...messages, {
        username,
        createdAt: new Date().getTime(),
        text
      }])
    })
  }

  renderMessages = () => {
    const {messages} = this.state
    let i = 0
    const messageCount = messages.length
    const tempMessages = []

    while (i < messageCount) {
      const previous = messages[i - 1]
      const current = messages[i]
      // const next = messages[i + 1]
      const isMine = current.username === this.props.auth.name
      const currentMoment = moment(current.createdAt)
      let prevBySameAuthor = false
      // const nextBySameAuthor = false
      let startsSequence = true
      const endsSequence = true
      let showTimestamp = true

      if (previous) {
        const previousMoment = moment(previous.createdAt)
        const previousDuration = moment.duration(currentMoment.diff(previousMoment))
        prevBySameAuthor = previous.username === current.username

        if (prevBySameAuthor && previousDuration.as('hours') < 1) {
          startsSequence = false
        }

        if (previousDuration.as('hours') < 1) {
          showTimestamp = false
        }
      }

      // if (next) {
      //   const nextMoment = moment(next.timestamp)
      //   const nextDuration = moment.duration(nextMoment.diff(currentMoment))
      //   nextBySameAuthor = next.author === current.author
      //
      //   if (nextBySameAuthor && nextDuration.as('hours') < 1) {
      //     endsSequence = false
      //   }
      // }

      tempMessages.push(
        <Message
          key={i}
          isMine={isMine}
          startsSequence={startsSequence}
          endsSequence={endsSequence}
          showTimestamp={showTimestamp}
          data={current}
          isGroup={this.props.chat.isGroup}
        />
      )

      // Proceed to the next message.
      i += 1
    }

    return tempMessages
  }

  render() {
    console.log('Etime: ', new Date().getTime())

    return (
      <div className="message-list">
        <div className="message-list-container">{this.renderMessages()}</div>
        <Compose
          onMessageSend={this.onMyMessageSend}
          rightItems={[
            <ToolbarButton key="image" icon="ion-ios-image"/>,
            <ToolbarButton key="emoji" icon="ion-ios-happy"/>
          ]}
        />
      </div>
    )
  }

  componentWillUnmount() {
    this.setMessages([])
    disJoinGroup({
      username: this.props.auth.name,
      room: this.props.chat.room
    }, () => {
      console.log('Disjoin group')
    })
  }
}

const mapStateToProps = state => ({
  auth: state.auth,
})

export default connect(mapStateToProps, actions)(MessageList)
