import React, { useEffect, useState } from 'react'
import Loader from 'react-loader-spinner'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { loadUserChats } from '../../actions'

function Contacts(props) {
  const [contactList, setContactList] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentContact, setCurrentContact] = useState({})

  const onContactSelect = (ct) => {
    setCurrentContact(ct)
    props.onChatSelect(ct)
  }

  const initUserChats = async () => {
    try {
      if (!props.chat.list || !props.chat.list.length) {
        await props.loadUserChats()
      }
    } catch (e) {
      console.log('Failed to load user chats', e)
    } finally {
      setLoading(false)
    }
  }


  // Load chats on mount
  useEffect(() => {
    initUserChats()
  }, [])

  // Update chats state based on store update
  useEffect(() => {
    if (props.chat.list && props.chat.list.length) {
      let chatList = props.chat.list
      if (props.searchText) {
        const regex = new RegExp(props.searchText, 'i')
        chatList = props.chat.list.filter(ct => (ct.name.search(regex) > -1))
      }
      setContactList(chatList)
      if (!currentContact.name) {
        onContactSelect(props.chat.list[0])
      }
    }
  }, [props.chat, props.searchText])


  return (
    <div className="contacts sideContacts">
      {loading ? <Loader className="chatLoader" type="ThreeDots" height={80} width={80} />
        : (
          <ul>
            {
              contactList.map(contact => (
                <li
                  className={contact._id === currentContact._id ? 'contact active' : 'contact'}
                  key={contact._id}
                  onClick={() => { onContactSelect(contact) }}
                >
                  <div className="wrap sideWrap">
                    {/*<span className="contact-status online" />*/}
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
        )}
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