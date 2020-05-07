import React from 'react'
import { connect } from 'react-redux'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSignOutAlt, faUserFriends, faUserPlus } from '@fortawesome/free-solid-svg-icons'
import { logoutUser } from '../../actions'

function WelcomeScreen(props) {
  const onLogoutClick = async e => {
    e.preventDefault()
    await props.logoutUser()
    window.href = '/sign-in'
  }


  return (
    <div className="welcomeScreen row h-100">
      <div className="col-sm-12 my-auto mb-4">
        <h3 className="h3 mb-3 font-weight-normal">Welcome to Catch-Ya!!!</h3>
        <div
          className="image mb-4"
        />
        <div
          className="form-row text-center"
        >
          <div className="col-12">
            <p>Chat with your friends, family and groups</p>
          </div>
        </div>

        <div className="form-row text-center">
          <div className="col-12">
            <div className="bottom-bar">
              <div
                className="mt-4 cursor-pointer"
                title="Find Contacts/Group"
                data-toggle="modal"
                data-target="#addFormModel"
                data-whatever="@mdo"
              >
                <FontAwesomeIcon icon={faUserPlus} />
                <span style={{ paddingLeft: '5px' }}>Start New Chat</span>
              </div>
              <div
                className="mt-4 cursor-pointer"
                title="Create Group"
                data-toggle="modal"
                data-target="#addGroupModel"
                data-whatever="@mdo"
              >
                <FontAwesomeIcon icon={faUserFriends} />
                <span style={{ paddingLeft: '5px' }}>Create Group</span>
              </div>
              <div
                className="mt-4 cursor-pointer"
                style={{ width: '100%' }}
                title="Logout"
                onClick={onLogoutClick}
              >
                <FontAwesomeIcon icon={faSignOutAlt} />
                <span style={{ paddingLeft: '5px' }}>Logout</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default connect(
  null,
  { logoutUser }
)(WelcomeScreen)