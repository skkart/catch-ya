import React, { useState } from 'react'
import { connect } from 'react-redux'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUserPlus, faUserFriends, faSignOutAlt } from '@fortawesome/free-solid-svg-icons'
import Profile from './Profile'
import Search from './Search'
import Contacts from './Contacts'
import AddChatsModel from './AddChatsModel'
import AddGroupModel from './AddGroupModel'
import { logoutUser } from '../../actions'


function SidePanel(props) {
  const [refreshCount, setRefreshCount] = useState(0)
  const [searchText, setSearchText] = useState('')

  const onLogoutClick = async e => {
    e.preventDefault()
    await props.logoutUser()
    console.log('Href sign')
    window.location.replace('/sign-in')
  }

  return (
    <div className="sidepanel">
      <Profile />
      <Search
        className="search"
        onChatSearch={(text) => {
          setSearchText(text)
        }}
      />
      <Contacts onChatSelect={props.onChatSelect} searchText={searchText} />
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
        <button
          style={{ width: '100%' }}
          title="Logout"
          onClick={onLogoutClick}
        >
          <FontAwesomeIcon icon={faSignOutAlt} />
          <span style={{ paddingLeft: '5px' }}>Logout</span>
        </button>
      </div>
      <AddChatsModel refreshCount={refreshCount} />
      <AddGroupModel />
    </div>
  )
}


const mapStateToProps = state => ({
  auth: state.auth
})

export default connect(
  mapStateToProps,
  { logoutUser }
)(SidePanel)