import React, { Component } from 'react'
import { connect } from 'react-redux'
import { logoutUser } from '../actions'
import { initSocket } from '../chat'

import Messenger from './Messenger'
import ImageUploader from "./ImageUploader";

class Dashboard extends Component {
  constructor (props) {
    super(props)
    initSocket()
  }

  onLogoutClick = e => {
    e.preventDefault()
    this.props.logoutUser()
  };

  render() {
    return (
      <div>
        <Messenger />
      </div>
    )
    // const { name } = this.props.auth
  }
}
const mapStateToProps = state => ({
  auth: state.auth
})
export default connect(
  mapStateToProps,
  { logoutUser }
)(Dashboard)