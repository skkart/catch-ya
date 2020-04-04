import React from 'react'
import moment from 'moment'
import './index.css'

export default function Message(props) {
  const {
    data,
    isMine,
    startsSequence,
    endsSequence,
    showTimestamp
  } = props

  const friendlyTimestamp = moment(data.createdAt).format('LLLL')
  const eachChatTimestamp = moment(data.createdAt).format('h:mm a') // 1:55 pm
  return (
    <div className={[
      'message',
      `${isMine ? 'mine' : ''}`,
      `${startsSequence ? 'start' : ''}`,
      `${endsSequence ? 'end' : ''}`
    ].join(' ')}
    >
      {
        showTimestamp && (
          <div className="timestamp">
            { friendlyTimestamp }
          </div>
        )}

      <div className="bubble-container">
        <div className="bubble" title={friendlyTimestamp}>
          { data.text }
        </div>
        <div className="time">
          { eachChatTimestamp }
        </div>
      </div>
    </div>
  )
}