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
        (data.username && showTimestamp) && <span>{timestampContent}</span>
      }
      {
        data.username ?
          <p>{data.text}</p>
          : (<small>
          &#x02015;&#x02015;&#x02015;
            {` ${moment(data.createdAt).format('DD MMM YYYY')} `}
              &#x02015;&#8213;&#x02015;
          </small>

          )}
    </li>
  )
}