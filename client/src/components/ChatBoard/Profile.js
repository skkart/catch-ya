import React from 'react'
import { connect } from 'react-redux'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronDown } from '@fortawesome/free-solid-svg-icons'

function Profile(props) {
  return (
    <div className="profile">
      <div className="wrap">
        <img src={`data:image/png;base64,${props.auth.avatar}`} className="online" alt="" />
        <p>{props.auth.name}</p>
        <FontAwesomeIcon icon={faChevronDown} className="expand-button"/>
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
    </div>
  )
}


const mapStateToProps = state => ({
  auth: state.auth
})

export default connect(
  mapStateToProps,
  null
)(Profile)