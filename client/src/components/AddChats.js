import React, { useEffect, useState } from 'react'
import { withRouter } from 'react-router-dom'
import axios from 'axios'
import { connect } from 'react-redux'
import { resetUserChats } from '../actions'

function AddChats(props) {
  const [conversations, setConversations] = useState([])
  const [isListLoaded, setIsListLoaded] = useState(false)
  const [chatSelect, setChatSelect] = useState('')

  const [chatGroupForm, setChatGroupForm] = useState({
    name: '',
    status: ''
  })

  const addUser = async () => {
    if (!chatSelect) {
      return
    }
    const chatObj = conversations.find((chat) => chat._id === chatSelect)
    await axios.post('/users/connections/add', {
      refId: chatSelect,
      refType: chatObj.email ? 'user' : 'chatgroup'
    })
    props.resetUserChats()
  }

  async function fetchAllConnections() {
    setIsListLoaded(false)
    const res = await axios.get('/users/connections/rest')
    res.data && setConversations([...res.data])
    setIsListLoaded(true)
  }

  const onChatGroupSubmit = async (e) => {
    e.preventDefault()
    console.log('chatGroupForm, ', chatGroupForm)
    if (chatGroupForm.name) {
      const added = await axios.post('/chatGroups', chatGroupForm)
      console.log('added group', added)
      props.resetUserChats()
    }
  }

  console.log('Chat list')
  useEffect(() => {
    fetchAllConnections()
  }, [])


  const listItems = conversations.map((chat) => (
    <option
      key={chat._id}
      value={chat._id}
    >
      {chat.email ? `${chat.name} -User` : `${chat.name} - Chat Group`}
    </option>
  ))

  return (
    <div className="addChats">
      <div className="input-group mb-3">
        {isListLoaded && (
          <select
            className="custom-select"
            value={chatSelect}
            onChange={(e) => {
              setChatSelect(e.target.value)
            }}
            aria-label="Example select with button addon"
          >
            <option value="">Choose User</option>
            {
              listItems
            }
          </select>
        )
        }
        <div className="input-group-prepend">
          <button className="btn btn-outline-secondary" type="button" onClick={addUser}>Add</button>
        </div>
      </div>

      <div className="addGroups">
        <form noValidate onSubmit={onChatGroupSubmit}>
          <div className="form-group">
            <label htmlFor="name">Group Name</label>
            <input
              type="text"
              className="form-control"
              id="name"
              placeholder="Enter Group Name"
              value={chatGroupForm.name}
              onChange={(e) => {
                setChatGroupForm({
                  name: e.target.value,
                  status: chatGroupForm.status
                })
              }}
            />
          </div>
          <div className="form-group">
            <label htmlFor="status">Status</label>
            <input
              type="text"
              className="form-control"
              id="status"
              placeholder=""
              value={chatGroupForm.status}
              onChange={(e) => {
                setChatGroupForm({
                  name: chatGroupForm.name,
                  status: e.target.value
                })
              }}
            />
          </div>
          <button type="submit" className="btn btn-primary">Submit</button>
        </form>
      </div>
    </div>
  )
}

const mapStateToProps = state => ({
  chat: state.chat
})

export default connect(
  mapStateToProps,
  { resetUserChats }
)(withRouter(AddChats))