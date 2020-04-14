import React, { useState, useEffect, useRef } from 'react'
import { connect } from 'react-redux'
import moment from 'moment'
import Picker, { SKIN_TONE_NEUTRAL } from 'emoji-picker-react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPaperPlane, faSmileBeam } from '@fortawesome/free-solid-svg-icons'
import Message from './Message'
import {
  joinGroup,
  registerMessage,
  registerRoomData,
  disJoinGroup,
  sendMessage,
  unregisterMessage,
} from '../../chat'
import useOutsideClicker from './OutsideClicker'

function MessageBlock(props) {
  const [chatList, setChatList] = useState([])
  const [showChat, setShowChat] = useState(false)
  const [msg, setMsg] = useState('')
  const [showEmoji, setShowEmoji] = useState(false)
  const [chosenEmoji, setChosenEmoji] = useState(null)
  const inputMsgRef = useRef(null)
  useOutsideClicker(inputMsgRef, () => {
    setShowEmoji(false)
  })

  const onEmojiClick = (event, emojiObject) => {
    setChosenEmoji(emojiObject)
    console.log(emojiObject)
    window.emo = emojiObject
    setMsg((m) => (m + emojiObject.emoji))
  }


  const username = props.auth.name.toLowerCase()
  const userId = props.auth._id
  const { room } = props.info

  const scrollToBottom = () => setTimeout(() => {
    document.getElementById('scrollMsgBlock').scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, 50)

  // Load chats on mount
  useEffect(() => {
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
    console.log('Useeff', room)
    // Join the group and register to socket events
    const messageReceiver = (othersMsg) => {
      console.log('othersMsg.room', othersMsg.room)
      console.log('props.info.room', room)
      if (othersMsg.room === room) {
        // update the received msg
        setChatList(chatListOld => [...chatListOld, othersMsg])
        scrollToBottom()
      }
    }
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
      console.log('Useeff unmount', room)
      setChatList([])
      unregisterMessage(messageReceiver)
      disJoinGroup({
        userId,
        username,
        room
      }, () => {
        console.log('Disjoin group')
      })
    }
  }, [room])


  // onSend Method
  const onMyMessageSend = (text) => {
    if (!text) {
      return
    }
    sendMessage({text}, () => {
      console.log('MyMsg sed', text)
      setChatList([...chatList, {
        username,
        createdAt: new Date().getTime(),
        text
      }])
      setMsg('')
      setShowEmoji(false)
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
      <div ref={inputMsgRef} className="message-input">
        <div className={showEmoji ? 'emoji-box' : 'hide'}>
          <Picker onEmojiClick={onEmojiClick} skinTone={SKIN_TONE_NEUTRAL} />
        </div>
        <div className="wrap">
          <textarea
            type="text"
            placeholder="Write your message..."
            value={msg}
            onChange={onChange}
            onKeyPress={onKeyPress}
          />
          <div className="wrapSmily" onClick={() => setShowEmoji((r) => !r)}>
            <FontAwesomeIcon icon={faSmileBeam} className="attachment" />
          </div>
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