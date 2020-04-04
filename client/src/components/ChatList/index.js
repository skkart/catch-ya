import React, { useState, useEffect, } from 'react'
import axios from 'axios'
import { connect } from 'react-redux'
import Search from '../Search'
import GroupItem from '../GroupItem'
import Toolbar from '../Toolbar'
import ToolbarButton from '../ToolbarButton'

import './index.css'
import { getGroupName } from '../../utils/auth-helper'

function ChatList(props) {
  const [conversations, setConversations] = useState([])

  const getConversations = () => {
    axios.get('/users/connections').then(response => {
      const newConversations = response.data.map(({
        name, about, avatar, _id
      }) => ({
        photo: avatar,
        name,
        text: about,
        room: getGroupName(_id, props.auth._id)
      }))
      setConversations([...conversations, ...newConversations])
    })
  }

  useEffect(() => {
    getConversations()
  }, [])

  return (
    <div className="conversation-list">
      <Toolbar
        title="Messenger"
        leftItems={[
          <ToolbarButton key="cog" icon="ion-ios-cog" />
        ]}
        rightItems={[
          <ToolbarButton key="add" icon="ion-ios-add-circle-outline" />
        ]}
      />
      <Search />
      {
        conversations.map(conversation => (
          <GroupItem
            key={conversation.name}
            data={conversation}
            onSelect={props.onChatSelection}
          />
        ))
      }
    </div>
  )
}

const mapStateToProps = state => ({
  auth: state.auth
})

export default connect(
  mapStateToProps,
  null
)(ChatList)