import React, { useState, useEffect } from 'react'
import { connect } from 'react-redux'
import moment from 'moment'
import Message from './Message'
import {
  joinGroup, registerMessage, registerRoomData, disJoinGroup
} from '../../chat'

function MessageBlock(props) {
  const [chatList, setChatList] = useState([])
  const [showChat, setShowChat] = useState(false)

  const username = props.auth.name
  const { room } = props.info

  // Load chats on mount
  useEffect(() => {
    registerMessage((msg) => {
      // update the received msg
      setChatList([...chatList, msg])
    })

    registerRoomData((roomData) => {
      try {
        const rawChatLog = roomData.chatLogs
        const jsonStr = `[${rawChatLog.slice(0, -1)}]`
        const jsonChatArr = JSON.parse(jsonStr)
        console.log('Reg', jsonChatArr)
        setChatList(jsonChatArr)
      } catch (e) {
        console.log('Chat log parsing issue', e)
      }
    })

    // Return unmount
    return () => {
      setChatList([])
    }
  }, [])

  // On Room update
  useEffect(() => {
    // Join the group and register to socket events
    joinGroup({
      username,
      room
    }, () => {
      setShowChat(true)
    })

    // Return unmount
    return () => {
      setChatList([])
      disJoinGroup({
        username,
        room
      }, () => {
        console.log('Disjoin group')
      })
    }
  }, [room])


  // onSend Method
  // onMyMessageSend = (text) => {
  //   const {messages} = this.state
  //   const username = this.props.auth.name
  //   sendMessage(text, () => {
  //     this.setMessages([...messages, {
  //       username,
  //       createdAt: new Date().getTime(),
  //       text
  //     }])
  //   })
  // }

  const renderChatBlocks = () => {
    let i = 0
    const messageCount = chatList.length
    const blockMessages = []
    const { isGroup } = props.info
    let startDayTime = moment(chatList[0].createdAt).startOf('day').unix() * 1000
    const oneDayinMs = 86400000
    blockMessages.push(
      <Message
        key={`time${i}`}
        showTimestamp={startDayTime}
        data={{ createdAt: startDayTime }}
        isGroup={isGroup}
      />
    )
    while (i < messageCount) {
      const previous = chatList[i - 1]
      const current = chatList[i]
      const isMine = current.username === username
      const currentMoment = moment(current.createdAt)
      let showTimestamp = true
      if (previous) {
        // If its the same user -- Dont so time for next 5mins
        if (previous.username === current.username) {
          const previousMoment = moment(previous.createdAt)
          const previousMinutes = currentMoment.diff(previousMoment, 'minutes')
          if (previousMinutes < 5) {
            showTimestamp = false
          }
        }
      }

      // Show time for every days
      if (current.createdAt > (startDayTime + oneDayinMs)) {
        startDayTime += oneDayinMs
        blockMessages.push(
          <Message
            key={`time${i}`}
            showTimestamp={startDayTime}
            isGroup={isGroup}
            data={{ createdAt: startDayTime }}
          />
        )
      }

      blockMessages.push(
        <Message
          key={i}
          isMine={isMine}
          showTimestamp={showTimestamp}
          data={current}
          isGroup={props.info.isGroup}
        />
      )
      i += 1
    }

    return blockMessages
  }

  return (
    <div className="messageblock">
      <div className="messages">
        <ul>
          {showChat && renderChatBlocks()}
        </ul>
      </div>
    </div>
  )
}


const mapStateToProps = state => ({
  auth: state.auth,
})

export default connect(mapStateToProps, null)(MessageBlock)