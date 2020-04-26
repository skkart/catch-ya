import React, { useRef, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPaperPlane, faSearch, faSmileBeam } from '@fortawesome/free-solid-svg-icons'
import { debounce } from 'lodash'
import connect from 'react-redux/es/connect/connect'
import Picker, { SKIN_TONE_NEUTRAL } from 'emoji-picker-react'
import useOutsideClicker from './OutsideClicker'
import { sendMessage } from '../../chat'

function MessageInput(props) {
  const [msg, setMsg] = useState('')
  const [showEmoji, setShowEmoji] = useState(false)
  const [chosenEmoji, setChosenEmoji] = useState(null)
  const inputMsgRef = useRef(null)


  const username = props.auth.name.toLowerCase()
  const userId = props.auth._id
  const { room } = props.info
  const receiverName = !props.info.isGroup && props.info.name.toLowerCase()

  useOutsideClicker(inputMsgRef, () => {
    setShowEmoji(false)
  })

  const onEmojiClick = (event, emojiObject) => {
    setChosenEmoji(emojiObject)
    setMsg((m) => (m + emojiObject.emoji))
  }

  // onSend Method
  const onMyMessageSend = (text) => {
    if (!text) {
      return
    }
    const msgObj = {
      userId,
      room,
      username,
      message: text,
    }
    if (receiverName === username) {
      msgObj.hasSameNames = true
    }
    sendMessage(msgObj, () => {
      setMsg('')
      setShowEmoji(false)
      props.onMessageSubmit({
        username,
        createdAt: Date.now(),
        text
      })
    })
  }


  const sendMsg = () => {
    onMyMessageSend(msg)
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
    <div ref={inputMsgRef} className="message-input">
      <div className={showEmoji ? 'emoji-box' : 'hide'}>
        <Picker onEmojiClick={onEmojiClick} skinTone={SKIN_TONE_NEUTRAL} />
      </div>
      <div className="wrap">
        <textarea
          type="text"
          placeholder="Write your message..."
          value={msg}
          onChange={onChange}
          onKeyPress={onKeyPress}
        />
        <div className="wrapSmily" onClick={() => setShowEmoji((r) => !r)}>
          <FontAwesomeIcon icon={faSmileBeam} className="attachment" />
        </div>
        <button className="submit" onClick={sendMsg}>
          <FontAwesomeIcon icon={faPaperPlane} />
        </button>
      </div>
    </div>
  )
}


const mapStateToProps = state => ({
  auth: state.auth,
})

export default connect(mapStateToProps, null)(MessageInput)