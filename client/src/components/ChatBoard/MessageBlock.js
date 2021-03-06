import React, { useState, useEffect } from 'react'
import { connect } from 'react-redux'
import moment from 'moment'
import Message from './Message'
import {
  joinGroup,
  registerMessage,
  registerRoomData,
  disJoinGroup,
  unregisterMessage,
  unregisterRoomData
} from '../../chat'
import MessageInput from './MessageInput'

function MessageBlock(props) {
  const [chatList, setChatList] = useState([])
  const [showChat, setShowChat] = useState(false)

  const username = props.auth.name.toLowerCase()
  const userId = props.auth._id
  const { room } = props.info

  const scrollToBottom = () => setTimeout(() => {
    document.getElementById('scrollMsgBlock').scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, 50)

  // On Room update
  useEffect(() => {
    // Join the group and register to socket events
    const messageReceiver = (othersMsg) => {
      if (othersMsg.room === room) {
        // update the received msg
        console.log(othersMsg)
        setChatList(chatListOld => [...chatListOld, othersMsg])
        scrollToBottom()
      }
    }

    const roomDataReceiver = (roomData) => {
      try {
        if (roomData && roomData.room === room) {
          window.chatLogs = roomData.chatLogs
          console.log(roomData.chatLogs)
          setChatList(roomData.chatLogs)
          scrollToBottom()
        }
      } catch (e) {
        console.log('Chat log parsing issue', e)
      }
    }

    registerRoomData(roomDataReceiver)
    registerMessage(messageReceiver)
    joinGroup({
      userId,
      username,
      room
    }, () => {
      setShowChat(true)
    })

    // Return unmount
    return () => {
      setChatList([])
      unregisterMessage(messageReceiver)
      unregisterRoomData(roomDataReceiver)
      disJoinGroup({
        userId,
        room
      }, () => {
        console.log('Disjoin group')
      })
    }
  }, [room])


  const onMessageSubmit = (msgObj) => {
    setChatList([...chatList, msgObj])
    scrollToBottom()
  }

  const renderChatBlocks = () => {
    let i = 0
    const messageCount = chatList.length
    const blockMessages = []

    if (!messageCount) {
      return blockMessages
    }

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
      let isMine = current.username === username

      if (current.userId) {
        isMine = current.userId === userId
      }

      const currentMoment = moment(current.createdAt)
      let showTimestamp = true
      if (previous) {
        // If its the same user -- Dont so time for next 5mins
        let isSameUserMsgs = previous.username === current.username
        if (current.userId) {
          isSameUserMsgs = previous.userId === current.userId
        }

        if (isSameUserMsgs) {
          const previousMoment = moment(previous.createdAt)
          const previousMinutes = currentMoment.diff(previousMoment, 'minutes')
          if (previousMinutes < 5) {
            showTimestamp = false
          }
        }
      }

      // Show time for every days
      const crrTime = currentMoment.unix() * 1000
      if (crrTime > (startDayTime + oneDayinMs)) {
        startDayTime = currentMoment.startOf('day').unix() * 1000
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
        <span id="scrollMsgBlock" className="notVisible">scroll block</span>
      </div>
      <MessageInput info={props.info} onMessageSubmit={onMessageSubmit} />
    </div>
  )
}


const mapStateToProps = state => ({
  auth: state.auth,
})

export default connect(mapStateToProps, null)(MessageBlock)