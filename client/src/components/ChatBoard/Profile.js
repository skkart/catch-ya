import React from 'react'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSignOutAlt } from '@fortawesome/free-solid-svg-icons'
import UpdateUserModel from './UpdateUserModel'
import { logoutUser } from '../../actions'

function Profile(props) {

  const onLogoutClick = async e => {
    e.preventDefault()
    await props.logoutUser()
    props.history.push('/sign-in')
  }


  return (
    <div className="profile">
      <div className="wrap">
        <img
          src={`data:image/png;base64,${props.auth.avatar}`}
          className="online"
          alt=""
          data-toggle="modal"
          data-target="#updateUserProfile"
          data-whatever="@mdo"
        />
        <p>{props.auth.name}</p>
        <FontAwesomeIcon icon={faSignOutAlt} className="expand-button logout-button" onClick={onLogoutClick} />
        <div className="status-options">
          <ul>
            <li id="status-online" className="active">
              <span className="status-circle" />
              <p>Online</p>
            </li>
            <li id="status-away" className="">
              <span className="status-circle" />
              <p>Away</p>
            </li>
            <li id="status-busy" className="">
              <span className="status-circle" />
              <p>Busy</p>
            </li>
            <li id="status-offline">
              <span className="status-circle" />
              <p>Offline</p>
            </li>
          </ul>
        </div>
      </div>
      <UpdateUserModel />
    </div>
  )
}

const mapStateToProps = state => ({
  auth: state.auth
})

export default connect(
  mapStateToProps,
  { logoutUser }
)(withRouter(Profile))