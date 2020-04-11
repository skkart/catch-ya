import React, { Component } from 'react'
import {
  BrowserRouter as Router,
  Route,
  Switch
} from 'react-router-dom'
import ReactNotification from 'react-notifications-component'
import Loader from 'react-loader-spinner'
import 'bootstrap/dist/js/bootstrap'
import { connect } from 'react-redux'
import { logoutUser, initUserAuth } from './actions'

//Import all CSS for App
import 'react-notifications-component/dist/theme.css'
import 'react-loader-spinner/dist/loader/css/react-spinner-loader.css'
import 'bootstrap/dist/css/bootstrap.css'
import './css/app.css'


import Login from './components/Login'
import SignUp from './components/SignUp'
import PrivateRoute from './private-route/PrivateRoute'
import Chatboard from './components/ChatBoard'

class App extends Component {
  onLogoutClick = e => {
    e.preventDefault()
    this.props.logoutUser()
  }

  componentDidMount() {
    this.props.initUserAuth()
  }

  render() {
    const isAuth = this.props.auth && this.props.auth.isAuth
    if (isAuth === null) {
      return (<Loader className="chatLoader" type="ThreeDots" height={250} width={250} />)
    }

    return (
      <Router>
        <div className="App">
          <ReactNotification />
          <div className="auth-wrapper">
            <Switch>
              <Route exact path="/" component={Login} />
              <Route path="/sign-in" component={Login} />
              <Route path="/sign-up" component={SignUp} />
              <Switch>
                <PrivateRoute exact path="/dashboard" component={Chatboard} />
              </Switch>
            </Switch>
          </div>
        </div>
      </Router>
    )
  }
}


const mapStateToProps = state => ({
  auth: state.auth
})
export default connect(mapStateToProps, { logoutUser, initUserAuth })(App)
