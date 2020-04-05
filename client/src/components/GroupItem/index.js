import React, { useEffect } from 'react'
import shave from 'shave'

import './index.css'

export default function ConversationListItem(props) {
  useEffect(() => {
    shave('.conversation-snippet', 200)
  })

  const {
    photo, name, text, room, count, isGroup
  } = props.data

  return (
    <div className="conversation-list-item" onClick={() => props.onSelect({ name, room, isGroup })}>
      <img className="conversation-photo" src={`data:image/png;base64,${photo}`} alt="conversation" />
      <div className="conversation-info">
        <h1 className="conversation-title">{ name }</h1>
        <p className="conversation-snippet">{ text }</p>
      </div>
      {count && (
        <div className="conversation-count">
          <span className="step">{count}</span>
        </div>
      )}
    </div>
  )
}