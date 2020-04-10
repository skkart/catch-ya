import React, { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUserPlus, faUserFriends } from '@fortawesome/free-solid-svg-icons'
import Profile from './Profile'
import Search from './Search'
import Contacts from './Contacts'
import AddFormModel from './AddFormModel'
import AddGroupModel from './AddGroupModel'


export default function SidePanel(props) {
  const [refreshCount, setRefreshCount] = useState(0)
  return (
    <div className="sidepanel">
      <Profile />
      <Search />
      <Contacts onChatSelect={props.onChatSelect} />
      <div className="bottom-bar">
        <button
          title="Find Contacts/Group"
          data-toggle="modal"
          data-target="#addFormModel"
          data-whatever="@mdo"
          onClick={() => setRefreshCount(ct => ct + 1)}
        >
          <FontAwesomeIcon icon={faUserPlus} />
          <span style={{ paddingLeft: '5px' }}>Start New Chat</span>
        </button>
        <button
          title="Create Group"
          data-toggle="modal"
          data-target="#addGroupModel"
          data-whatever="@mdo"
        >
          <FontAwesomeIcon icon={faUserFriends} />
          <span style={{ paddingLeft: '5px' }}>Create Group</span>
        </button>
      </div>
      <AddFormModel refreshCount={refreshCount} />
      <AddGroupModel />
    </div>
  )
}