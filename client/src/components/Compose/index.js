import React, { useState } from 'react'
import './index.css'

export default function Compose(props) {
  const [msg, setMsg] = useState([])

  const sendMsg = () => {
    props.onMessageSend(msg)
    setMsg('')
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

  return (
    <div className="compose">
      <input
        type="text"
        className="compose-input"
        placeholder="Type a message"
        value={msg}
        onChange={onChange}
        onKeyPress={onKeyPress}
      />
      <i
        className="toolbar-button ion-ios-send"
        onClick={sendMsg}
      />
      {
        props.rightItems
      }
    </div>
  )
}