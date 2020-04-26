import React, { useState, useEffect, useRef } from 'react'
import { connect } from 'react-redux'
import '../../css/reset.min.css'
import '../../css/chatboard.css'
import { throttle } from 'lodash'
import SidePanel from './SidePanel'
import ChatContent from './ChatContent'
import WelcomeScreen from './WelcomeScreen'
import {
  destroySocket,
  initSocket,
  registerUserOffline,
  registerUserOnline,
  registerUserAway,
  registerNotification,
  registerNewUserConnections
} from '../../chat'
import { updateUserChats, setCurrentChatProfile, loadUserChats } from '../../actions'
import useAudio from './ChatAudio'


function ChatBoard(props) {
  const [chat, setChat] = useState(null)
  // Use ref to update user active status and props.chatlist
  const activeAction = useRef(null)
  const soundAction = useRef(null)
  const newUserAction = useRef(null)
  const [playing, play] = useAudio()

  const playSound = throttle(() => {
    const chatList = props.chat.list
    const currentChatUser = props.chat.current
    if (chatList && chatList.length) {
      const emittedRoom = soundAction.current.room
      let updateChatList = false
      for (let us = 0; us < chatList.length; us++) {
        if (chatList[us].room === emittedRoom) {
          // If the obtained room belongs to current user list, play the sound
          !playing && play()
          // If the user is chatting with others, update the count
          if (currentChatUser && emittedRoom !== currentChatUser.room) {
            chatList[us].unreadCount++
            updateChatList = true
          }
          break
        }
      }
      updateChatList && props.updateUserChats(props.chat.list)
    }
    soundAction.current.room = null
  }, 5)

  const setChatProfileAndResetCount = (chatObj) => {
    const chatList = props.chat.list
    if (chatList && chatList.length) {
      let updateChatList = false
      for (let us = 0; us < chatList.length; us++) {
        const user = chatList[us]
        if (chatObj._id === user._id && user.unreadCount) {
          user.unreadCount = 0
          updateChatList = true
          break
        }
      }
      updateChatList && props.updateUserChats(props.chat.list)
    }
    chatObj.unreadCount = 0
    props.setCurrentChatProfile(chatObj)
  }
  const updateUserStatus = (userId) => {
    const { userID, statusType } = activeAction.current
    if (userID && statusType) {
      const chatList = props.chat.list
      let updateChatList = false
      if (chatList && chatList.length) {
        for (let us = 0; us < chatList.length; us++) {
          const user = chatList[us]
          if (userID === user._id) {
            user.status = statusType
            updateChatList = true
            break
          }
        }
        updateChatList && props.updateUserChats(props.chat.list)
      }

      activeAction.current.userID = null
      activeAction.current.statusType = null
    }
  }

  const updateOnNewUser = () => {
    const { userID } = newUserAction.current
    if (userID && userID === props.auth._id) {
      props.loadUserChats()
    }
    newUserAction.current.userID = null
  }

  useEffect(() => {
    initSocket(props.auth._id)
    registerNotification(({ room }) => {
      soundAction.current.room = room
      soundAction.current.click()
    })
    registerUserOnline((usr) => {
      activeAction.current.userID = usr
      activeAction.current.statusType = 'online'
      activeAction.current.click()
    })
    registerUserOffline((usr) => {
      activeAction.current.userID = usr
      activeAction.current.statusType = 'offline'
      activeAction.current.click()
    })
    registerUserAway((usr) => {
      activeAction.current.userID = usr
      activeAction.current.statusType = 'away'
      activeAction.current.click()
    })

    registerNewUserConnections((newConnInfo) => {
      newUserAction.current.userID = newConnInfo.addId
      newUserAction.current.click()
    })

    const destroySocketFn = () => {
      destroySocket(props.auth._id)
    }

    window.addEventListener('beforeunload', destroySocketFn)

    return destroySocketFn
  }, [])

  return (
    <div className="chat-board">
      <SidePanel onChatSelect={chatObj => {
        setChat(chatObj)
        setChatProfileAndResetCount(chatObj)
      }}
      />
      {chat && chat.room ?
        <ChatContent info={chat} />
        :
        (!props.chat.list || !props.chat.list.length) && <WelcomeScreen />
      }
      <label ref={activeAction} className="float-right notVisible" onClick={updateUserStatus}>active</label>
      <button ref={soundAction} className="float-right notVisible" onClick={playSound}>Play</button>
      <label ref={newUserAction} className="float-right notVisible" onClick={updateOnNewUser}>NewUser</label>
    </div>
  )
}

const mapStateToProps = state => ({
  chat: state.chat,
  auth: state.auth
})

export default connect(
  mapStateToProps,
  { updateUserChats, setCurrentChatProfile, loadUserChats }
)(ChatBoard)