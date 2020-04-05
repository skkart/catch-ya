import React from 'react'
import ChatProfile from './ChatProfile'
import MessageBlock from './MessageBlock'


export default function ChatContent(props) {
  return (
    <div className="content">
      <ChatProfile info={props.info} />
      <MessageBlock info={props.info} />
    </div>
  )
}