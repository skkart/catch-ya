import React, { useEffect, useState, useRef } from 'react'
import axios from 'axios'
import { store } from 'react-notifications-component'
import { connect } from 'react-redux'
import { each } from 'lodash'
import Loader from 'react-loader-spinner'
import { loadUserChats } from '../../actions'
import { emitNewChats } from '../../chat'
import Search from './Search'
import { getGroupName } from '../../utils/auth-helper'

function AddChatsModel(props) {
  const closeButton = useRef(null)
  const [allList, setAllList] = useState([])
  const [loading, setLoading] = useState(false)
  const [contactList, setContactList] = useState([])
  const [groupList, setGroupList] = useState([])
  const [searchText, setSearchText] = useState('')
  const [submitted, setSubmitted] = useState(false)


  const fetchAllConnections = async() => {
    try {
      setLoading(true)
      const res = await axios.get('/users/connections/rest')
      setAllList(res.data)
    } catch (e) {
      console.log('Error on fetchAllConnections', e)
    } finally {
      setLoading(false)
    }
  }

  const addUser = async (chatObj) => {
    if (!chatObj || submitted) {
      return
    }
    setSubmitted(true)
    try {
      await axios.post('/users/connections/add', {
        refId: chatObj._id,
        refType: chatObj.email ? 'user' : 'chatgroup'
      })

      // Emit for only new chats
      chatObj.email && emitNewChats({
        fromId: props.auth._id,
        addId: chatObj._id,
        room: getGroupName(chatObj._id, props.auth._id)
      })

      await props.loadUserChats()
      store.addNotification({
        title: 'Success',
        message: 'Your chat selection is added!',
        type: 'success',
        insert: 'top',
        container: 'top-right',
        animationIn: ['animated', 'fadeIn', 'jackInTheBox'],
        animationOut: ['animated', 'fadeOut'],
        dismiss: {
          duration: 2000
        }
      })
      closeButton.current.click()
    } catch (err) {
      store.addNotification({
        title: 'Try again!!!',
        message: 'Failed to add your chat selection',
        type: 'danger',
        insert: 'top',
        container: 'top-right',
        animationIn: ['animated', 'fadeIn', 'jackInTheBox'],
        animationOut: ['animated', 'fadeOut'],
        dismiss: {
          duration: 3000,
          pauseOnHover: true
        }
      })
    } finally {
      setSubmitted(false)
    }
  }

  useEffect(() => {
    if (props.refreshCount > -1) {
      fetchAllConnections()
      console.log('Chat list fetchAllConnections')
    }
  }, [props.refreshCount])

  useEffect(() => {
    const ctList = []
    const gpList = []
    if (allList.length) {
      each(allList, (dt) => {
        if (searchText) {
          const regex = new RegExp(searchText, 'i')
          if (dt.name.search(regex) === -1) {
            // Dont add
            return
          }
        }
        if (dt.email) {
          ctList.push(dt)
        } else {
          gpList.push(dt)
        }
      })
    }
    setContactList(ctList)
    setGroupList(gpList)
  }, [allList, searchText])


  return (
    <div
      className="modal fade"
      id="addFormModel"
      tabIndex="-1"
      role="dialog"
      aria-hidden="true"
    >
      <div
        className={submitted ? 'modal-dialog modal-dialog-centered disabled-state' : 'modal-dialog modal-dialog-centered'}
        role="document"
      >
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Find People/Groups</h5>
            <button ref={closeButton} type="button" className="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          {loading ? <Loader className="chatLoaderMain" type="ThreeDots" height={50} width={80} />
            :
            <div className="modal-body">
              <form>
                <div className="form-group mx-sm-3 mb-2">
                  <Search
                    className="searchModel"
                    placeholder="Search People/Groups"
                    onChatSearch={(text) => {
                      setSearchText(text)
                    }}
                  />
                </div>
                <div className="form-group mx-sm-3 mb-2 contacts">
                  {
                    contactList.length > 0 &&
                    <span className="list-suggestion">People</span>
                  }
                  <ul className="list-group">
                    {contactList.map(contact => (
                      <li
                        className="list-group-item list-group-item-action list-group-item-light contact"
                        key={contact._id}
                        onClick={() => {
                          addUser(contact)
                        }}
                      >
                        <div className="wrap">
                          {contact.status && <span className={`contact-status ${contact.status}`}/>}
                          <img src={`data:image/png;base64,${contact.avatar}`} alt=""/>
                          <div className="meta">
                            <p className="name">{contact.name}</p>
                            <p className="preview">{contact.about}</p>
                          </div>
                        </div>
                      </li>
                    ))
                    }
                  </ul>
                  {
                    groupList.length > 0 &&
                    <span className="list-suggestion">Groups</span>
                  }
                  <ul className="list-group">
                    {groupList.map(contact => (
                      <li
                        className="list-group-item list-group-item-action list-group-item-light contact"
                        key={contact._id}
                        onClick={() => {
                          addUser(contact)
                        }}
                      >
                        <div className="wrap">
                          {/* <span className="contact-status online" /> */}
                          <img src={`data:image/png;base64,${contact.avatar}`} alt=""/>
                          <div className="meta">
                            <p className="name">{contact.name}</p>
                            <p className="preview">{contact.about}</p>
                          </div>
                        </div>
                      </li>
                    ))
                    }
                  </ul>
                  {
                    (!contactList.length && !groupList.length) &&
                    <span className="list-suggestion-not-found">No Users/Groups exists!!!</span>
                  }
                </div>
              </form>
            </div>
          }
        </div>
      </div>
    </div>
  )
}

const mapStateToProps = state => ({
  chat: state.chat,
  auth: state.auth
})

export default connect(
  mapStateToProps,
  { loadUserChats }
)(AddChatsModel)