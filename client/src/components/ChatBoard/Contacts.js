import React, { useEffect, useState } from 'react'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { loadUserChats } from '../../actions'

function Contacts(props) {
  const [contactList, setContactList] = useState([])

  // Load chats on mount
  useEffect(() => {
    if (!props.chat.list || !props.chat.list.length) {
      props.loadUserChats()
    }
  }, [])

  // Update chats state based on store update
  useEffect(() => {
    if (props.chat.list && props.chat.list.length) {
      setContactList([...props.chat.list])
    }
  }, [props.chat])


  return (
    <div className="contacts">
      <ul>
        {
          contactList.map(contact => (
            <li className="contact" key={contact._id} onClick={() => { props.onChatSelect(contact) }}>
              <div className="wrap">
                <span className="contact-status online" />
                <img src={`data:image/png;base64,${contact.avatar}`} alt="" />
                <div className="meta">
                  <p className="name">{contact.name}</p>
                  <p className="preview">{contact.about}</p>
                </div>
              </div>
            </li>
          ))
        }
      </ul>
    </div>
  )
}

const mapStateToProps = state => ({
  chat: state.chat
})

export default connect(
  mapStateToProps,
  { loadUserChats }
)(withRouter(Contacts))