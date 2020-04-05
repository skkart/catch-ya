import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUserPlus, faUserFriends } from '@fortawesome/free-solid-svg-icons'
import Profile from './Profile'
import Search from './Search'
import Contacts from './Contacts'


export default function SidePanel(props) {
  return (
    <div className="sidepanel">
      <Profile />
      <Search />
      <Contacts onChatSelect={props.onChatSelect} />
      <div className="bottom-bar">
        <button data-toggle="tooltip" data-placement="right" title="Add Contact">
          <FontAwesomeIcon icon={faUserPlus} />
          <span style={{paddingLeft: '5px'}}>Add contact</span>
        </button>
        <button data-toggle="tooltip" data-placement="right" title="Add Group">
          <FontAwesomeIcon icon={faUserFriends} />
          <span style={{paddingLeft: '5px'}}>Add group</span>
        </button>
      </div>
    </div>
  )
}