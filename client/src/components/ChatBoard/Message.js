import React from 'react'
import moment from 'moment'

export default function Message({
  showTimestamp, isMine, data, isGroup 
}) {
  const eachChatTimestamp = moment(data.createdAt).format('h:mm a') // 1:55 pm
  const liClass = showTimestamp ? 'timestamp' : ''

  let timestampContent = eachChatTimestamp
  if (!isMine && isGroup) {
    timestampContent = `${data.username}, ${eachChatTimestamp}`
  }

  return (
    <li className={isMine ? `sent ${liClass}` : `replies ${liClass}`}>
      {
        data.username && <span>{timestampContent}</span>
      }
      {
        data.username ?
          <p>{data.text}</p>
          :
          `------------- ${moment(data.createdAt).format('LLLL')} -------------`
      }
    </li>
  )
}