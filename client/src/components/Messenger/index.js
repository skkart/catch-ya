import React, { useState } from 'react'
import ChatList from '../ChatList'
import MessageList from '../MessageList'
// import 'ionicons'
import './messenger.css'

export default function Messenger(props) {
  const [chat, setChat] = useState(null)

  return (
    <div className="messenger">
      <div onClick={() => {
        setChat({
          name: '',
          room: '',
          isGroup: false
        })
      }}
      >
Reset Chat
      </div>
      <div className="scrollable sidebar">
        <ChatList onChatSelection={(chatObj) => { console.log('Stime: ', new Date().getTime()); setChat(chatObj) }} />
      </div>

      <div className="scrollable content">
        {chat && chat.room
          ? <MessageList chat={chat} />
          : <div>Select any user to start chatting</div>}
      </div>
    </div>
  )
}