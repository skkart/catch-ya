import React, { useState, useEffect } from 'react'
import { connect } from 'react-redux'
import Loader from 'react-loader-spinner'
import './reset.min.css'
import './chatboard.css'
import SidePanel from './SidePanel'
import ChatContent from './ChatContent'
import { destroySocket, initSocket } from '../../chat'


function ChatBoard(props) {
  const [chat, setChat] = useState(null)

  useEffect(() => {
    initSocket()

    return () => {
      destroySocket()
    }
  }, [])

  return (
    <div className="chat-board">
      <SidePanel onChatSelect={chatObj => setChat(chatObj)} />
      {chat && chat.room ?
        <ChatContent info={chat} />
        :
        props.chat.list && props.chat.list.length ?
          <Loader className="chatLoaderMain" type="ThreeDots" height={150} width={150} /> : <div>Welcome to CatchYa!!!</div>
      }
    </div>
  )
}

const mapStateToProps = state => ({
  chat: state.chat
})

export default connect(
  mapStateToProps,
  null
)(ChatBoard)