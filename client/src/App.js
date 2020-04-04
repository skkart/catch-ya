import React, { Component } from 'react'
import {
  BrowserRouter as Router,
  Route,
  Switch,
  Link,
} from 'react-router-dom'
import { connect } from 'react-redux'
import * as actions from './actions'

import '../node_modules/bootstrap/dist/css/bootstrap.min.css'
import './css/app.css'

// import HomePage from './components/HomePage'
import Login from './components/Login'
import SignUp from './components/SignUp'
import PrivateRoute from './private-route/PrivateRoute'
import Dashboard from './components/Dashboard'
import ImageUploader from './components/ImageUploader'

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
    let headerBar
    if (isAuth === null) {
      return (<div>Loading !!!</div>)
    }

    if (!isAuth) {
      headerBar = (
        <ul className="navbar-nav ml-auto">
          <li className="nav-item">
            <Link className="nav-link" to="/sign-in">Login</Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link" to="/sign-up">Sign up</Link>
          </li>
        </ul>
      )
    } else {
      headerBar = (
        <ul className="navbar-nav ml-auto">
          <li className="nav-item">
            <Link className="nav-link" to="/uploadAvatar">Upload Image</Link>
          </li>
          <li className="nav-item">
            <a className="nav-link" onClick={this.onLogoutClick}>Logout</a>
          </li>
        </ul>
      )
    }

    return (
      <Router>
        <div className="App">
          <nav className="navbar navbar-expand-lg navbar-light fixed-top">
            <div className="container">
              <Link className="navbar-brand" to={isAuth ? '/dashboard' : '/sign-in'}>Catch-Ya!!!</Link>
              <div className="collapse navbar-collapse">
                {headerBar}
              </div>
            </div>
          </nav>
          <div className="auth-wrapper">
            <Switch>
              <Route exact path="/" component={Login} />
              <Route path="/sign-in" component={Login} />
              <Route path="/sign-up" component={SignUp} />
              <Route path="/uploadAvatar" component={ImageUploader} />
              <Switch>
                <PrivateRoute exact path="/dashboard" component={Dashboard} />
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
export default connect(mapStateToProps, actions)(App)
