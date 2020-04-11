import React, { useState, useEffect } from 'react'
import { connect } from 'react-redux'
import moment from 'moment'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPaperPlane } from '@fortawesome/free-solid-svg-icons'
import Message from './Message'
import {
  joinGroup, registerMessage, registerRoomData, disJoinGroup, sendMessage
} from '../../chat'

function MessageBlock(props) {
  const [chatList, setChatList] = useState([])
  const [showChat, setShowChat] = useState(false)
  const [msg, setMsg] = useState('')


  const username = props.auth.name.toLowerCase()
  const { room } = props.info

  const scrollToBottom = () => setTimeout(() => {
    document.getElementById('scrollMsgBlock').scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, 50)

  // Load chats on mount
  useEffect(() => {
    registerMessage((othersMsg) => {
      // update the received msg
      setChatList(chatListOld => [...chatListOld, othersMsg])
      scrollToBottom()
    })

    registerRoomData((roomData) => {
      try {
        const rawChatLog = roomData.chatLogs
        const jsonStr = `[${rawChatLog.slice(0, -1)}]`
        const jsonChatArr = JSON.parse(jsonStr)
        setChatList(jsonChatArr)
      } catch (e) {
        console.log('Chat log parsing issue', e)
      } finally {
        scrollToBottom()
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
  const onMyMessageSend = (text) => {
    sendMessage(text, () => {
      console.log('MyMsg sed', text)
      setChatList([...chatList, {
        username,
        createdAt: new Date().getTime(),
        text
      }])
      setMsg('')
      scrollToBottom()
    })
  }


  const sendMsg = () => {
    onMyMessageSend(msg)
  }

  const onKeyPress = (e) => {
    const code = (e.keyCode ? e.keyCode : e.which)
    if (code === 13) {
      sendMsg()
    }
  }

  const onChange = (e) => {
    setMsg(e.target.value)
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
        <span id="scrollMsgBlock">scroll block</span>
      </div>
      <div className="message-input">
        <div className="wrap">
          <input
            type="text"
            placeholder="Write your message..."
            value={msg}
            onChange={onChange}
            onKeyPress={onKeyPress}
          />
          {/* <span> */}
          {/* <FontAwesomeIcon icon={faPaperclip} className="attachment" /> */}
          {/* </span> */}
          <button className="submit" onClick={sendMsg}>
            <FontAwesomeIcon icon={faPaperPlane} />
          </button>
        </div>
      </div>
    </div>
  )
}


const mapStateToProps = state => ({
  auth: state.auth,
})

export default connect(mapStateToProps, null)(MessageBlock)