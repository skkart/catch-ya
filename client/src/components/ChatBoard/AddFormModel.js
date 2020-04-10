import React, { useEffect, useState, useRef } from 'react'
import axios from 'axios'
import { connect } from 'react-redux'
import { each } from 'lodash'
import { loadUserChats } from '../../actions'

function AddFormModel(props) {
  const closeButton = useRef(null)
  const [contactList, setContactList] = useState([])
  const [groupList, setGroupList] = useState([])

  const fetchAllConnections = async() => {
    const res = await axios.get('/users/connections/rest')
    const ctList = []
    const gpList = []
    if (res.data) {
      each(res.data, (dt) => {
        if (dt.email) {
          ctList.push(dt)
        } else {
          gpList.push(dt)
        }
      })
    }
    setContactList(ctList)
    setGroupList(gpList)
  }

  const addUser = async (chatObj) => {
    if (!chatObj) {
      return
    }
    await axios.post('/users/connections/add', {
      refId: chatObj._id,
      refType: chatObj.email ? 'user' : 'chatgroup'
    })
    await props.loadUserChats()
    closeButton.current.click()
  }

  useEffect(() => {
    fetchAllConnections()
    console.log('Chat list refreshCount')
  }, [props.refreshCount])


  return (
    <div
      className="modal fade"
      id="addFormModel"
      tabIndex="-1"
      role="dialog"
      aria-hidden="true"
    >
      <div className="modal-dialog modal-dialog-centered" role="document">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">New Chat</h5>
            <button ref={closeButton} type="button" className="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div className="modal-body">
            <form>
              <div className="form-group mx-sm-3 mb-2">
                <label htmlFor="inputFind" className="sr-only">Search chat</label>
                <input type="text" className="form-control" id="inputFind" placeholder="Search" />
              </div>
              <div className="form-group mx-sm-3 mb-2 contacts">
                {
                  contactList.length &&
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
                {
                  groupList.length &&
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
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

const mapStateToProps = state => ({
  chat: state.chat
})

export default connect(
  mapStateToProps,
  { loadUserChats }
)(AddFormModel)