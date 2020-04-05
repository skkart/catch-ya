import React, { useState, useEffect } from 'react'
import './reset.min.css'
import './chatboard.css'
import SidePanel from './SidePanel'
import ChatContent from './ChatContent'
import {destroySocket, initSocket} from '../../chat'


export default function ChatBoard() {
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
        <div className="content">Click on any chat</div>
      }
    </div>
  )
}