import React, { useState, useEffect, useRef } from 'react'
import { connect } from 'react-redux'
import '../../css/reset.min.css'
import '../../css/chatboard.css'
import SidePanel from './SidePanel'
import ChatContent from './ChatContent'
import WelcomeScreen from './WelcomeScreen'
import {
  destroySocket, initSocket, registerUserOffline, registerUserOnline
} from '../../chat'
import { updateUserChats } from '../../actions'


function ChatBoard(props) {
  const [chat, setChat] = useState(null)
  // Use ref to update user active status and props.chatlist
  const activeAction = useRef(null)


  const updateUserStatus = (userId) => {
    const { userID, statusType } = activeAction.current
    if (userID && statusType) {
      const chatList = props.chat.list
      if (chatList && chatList.length) {
        chatList.forEach(user => {
          if (user.isGroup) {
            return
          }
          if (userID === user._id) {
            user.status = statusType
          }
        })
        props.updateUserChats(props.chat.list)
      }

      activeAction.current.userID = null
      activeAction.current.statusType = null
    }
  }

  useEffect(() => {
    initSocket(props.auth._id)
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

    return () => {
      console.log('destroy socket')
      destroySocket(props.auth._id)
    }
  }, [])

  return (
    <div className="chat-board">
      <SidePanel onChatSelect={chatObj => setChat(chatObj)} />
      {chat && chat.room ?
        <ChatContent info={chat} />
        :
        (!props.chat.list || !props.chat.list.length) && <WelcomeScreen />
      }
      <label ref={activeAction} className="float-right notVisible" onClick={updateUserStatus}>active</label>
    </div>
  )
}

const mapStateToProps = state => ({
  chat: state.chat,
  auth: state.auth
})

export default connect(
  mapStateToProps,
  { updateUserChats }
)(ChatBoard)