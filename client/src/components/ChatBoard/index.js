import React, { useState, useEffect } from 'react'
import Loader from 'react-loader-spinner'
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
        <Loader className="chatLoaderMain" type="ThreeDots" height={150} width={150} />
      }
    </div>
  )
}