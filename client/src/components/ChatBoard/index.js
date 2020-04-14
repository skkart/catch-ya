import React, { useState, useEffect } from 'react'
import { connect } from 'react-redux'
import '../../css/reset.min.css'
import '../../css/chatboard.css'
import SidePanel from './SidePanel'
import ChatContent from './ChatContent'
import { destroySocket, initSocket } from '../../chat'
import WelcomeScreen from './WelcomeScreen'


function ChatBoard(props) {
  const [chat, setChat] = useState(null)

  useEffect(() => {
    console.log('Init socket')
    initSocket()

    return () => {
      console.log('destroy socket', props.auth._id)
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
    </div>
  )
}

const mapStateToProps = state => ({
  chat: state.chat,
  auth: state.auth
})

export default connect(
  mapStateToProps,
  null
)(ChatBoard)