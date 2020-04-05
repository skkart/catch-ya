import React, { useState, useEffect, } from 'react'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import Search from '../Search'
import GroupItem from '../GroupItem'
import Toolbar from '../Toolbar'
import ToolbarButton from '../ToolbarButton'
import { loadUserChats } from '../../actions'

import './index.css'

function ChatList(props) {
  const [conversations, setConversations] = useState([])

  useEffect(() => {
    if (!props.chat.list || !props.chat.list.length) {
      props.loadUserChats()
    }
  }, [])

  useEffect(() => {
    if (props.chat.list && props.chat.list.length) {
      setConversations([...props.chat.list])
    }
  }, [props.chat])

  return (
    <div className="conversation-list">
      <Toolbar
        title="Messenger"
        leftItems={[
          <ToolbarButton key="cog" icon="ion-ios-cog" />
        ]}
        rightItems={[
          <i key="add" className={`toolbar-button ion-ios-add-circle-outline`} onClick={() => { props.history.push('/addChats') }} />
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
  chat: state.chat
})

export default connect(
  mapStateToProps,
  { loadUserChats }
)(withRouter(ChatList))