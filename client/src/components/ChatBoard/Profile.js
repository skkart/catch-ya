import React, { useEffect, useRef } from 'react'
import axios from 'axios'
import { connect } from 'react-redux'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faRecycle } from '@fortawesome/free-solid-svg-icons'
import UpdateUserModel from './UpdateUserModel'
import { updateUserChats } from '../../actions'

function Profile(props) {
  const refreshAction = useRef(null)
  const refreshStatus = async () => {
    try {
      if (props.chat.list && props.chat.list.length) {
        const activeUsers = await axios.get('/users/online')
        props.chat.list.forEach(user => {
          if (user.isGroup) {
            return
          }
          if (activeUsers.data.indexOf(user._id) > -1) {
            user.status = 'online'
          } else {
            user.status = 'offline'
          }
        })
        props.updateUserChats(props.chat.list)
      }
    } catch (e) {
      console.log('Error', e)
    }
  }

  useEffect(() => {
    let statusInterval = setInterval(() => {
      refreshAction.current.click()
    }, 1000 * 60 * 2) // Get all profile status every 2min

    return () => {
      clearInterval(statusInterval)
      statusInterval = null
    }
  }, [])

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
        <p className="profileName">{props.auth.name}</p>
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
        <label ref={refreshAction} className="float-right notVisible" onClick={refreshStatus}>
          <FontAwesomeIcon icon={faRecycle} aria-hidden="true" />
        </label>
      </div>
      <UpdateUserModel />
    </div>
  )
}

const mapStateToProps = state => ({
  auth: state.auth,
  chat: state.chat
})

export default connect(
  mapStateToProps,
  { updateUserChats }
)(Profile)