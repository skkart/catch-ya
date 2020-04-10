import React, { Component } from 'react'
import { connect } from 'react-redux'
import { each } from 'lodash'
import { Link } from 'react-router-dom'
import Loader from 'react-loader-spinner'
import * as actions from '../actions'

const emailRegex = /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/

class Login extends Component {
  constructor(props) {
    super(props)
    this.state = {
      submitted: false,
      email: '',
      password: '',
      errors: {
        email: '',
        password: '',
      },
    }
  }

  componentDidUpdate(props) {
    console.log('update', this.props.auth)
    if (this.props.auth && this.props.auth.email) {
      this.props.history.push('/dashboard') // push user to dashboard when they login
    }
  }

  componentDidMount(props) {
    if (this.props.auth && this.props.auth.email) {
      this.props.history.push('/dashboard') // push user to dashboard when they login
    }
  }

  validateLogin = () => {
    let valid = true
    each(this.state.errors, (eVal, ekey) => {
      if (this.state[ekey] && eVal) {
        valid = false
        return false
      }
    })
    return valid
  }

  onChange = (e) => {
    const { name, value } = e.target
    const { errors } = this.state

    switch (name) {
    case 'email':
      errors.email = emailRegex.test(value)
        ? ''
        : 'Email is not valid!'
      break
    case 'password':
      errors.password = value.length < 8
        ? 'Password must be 8 characters long!'
        : ''
      break
    default:
      break
    }
    this.setState({ [name]: value })
  }

  onSubmit = async (e) => {
    try {
      this.setState({
        submitted: true
      })
      e.preventDefault()
      const userData = {
        email: this.state.email,
        password: this.state.password,
      }
      await this.props.loginUser(userData) // since we handle the redirect within our component, we don't need to pass in this.props.history as a parameter
    } catch (err) {
      console.log('Failed to login', err)
    } finally {
      console.log('false it')
      this.setState({
        submitted: false
      })
    }
  }

  render() {
    const { errors } = this.state
    console.log('this.props.auth', this.props.auth, this.state)
    return (
      <div className="auth-inner">
        <form className={this.state.submitted ? 'disabled-state' : ''} noValidate onSubmit={this.onSubmit}>
          <h3>Sign In</h3>

          <div className="form-group">
            <label>Email address</label>
            <input
              type="email"
              className="form-control"
              name="email"
              placeholder="Enter email"
              onChange={this.onChange}
              value={this.state.email}
            />
            {errors.email.length > 0 &&
          <span className="error">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              className="form-control"
              placeholder="Enter password"
              onChange={this.onChange}
              value={this.state.password}
            />
            {errors.password.length > 0 &&
          <span className="error">{errors.password}</span>}
          </div>

          <div className="form-group">
            <div className="custom-control custom-checkbox">
              <input type="checkbox" className="custom-control-input" id="customCheck1" />
              <label className="custom-control-label" htmlFor="customCheck1">Remember me</label>
            </div>
          </div>

          {
            [(
              <button
                type="submit"
                className={this.props.auth.isLoginFailed ? 'btn btn-danger btn-block login-submit' : 'btn btn-primary btn-block login-submit'}
              >
                Submit
              </button>),
              (this.props.auth.isLoginFailed > 0 &&
                <span className="error">Please provide a valid username and password.</span>)
            ]
          }

          <div className="form-group">
            <p className="forgot-password text-right">
              New User
              <Link to="/sign-up"> sign up?</Link>
            </p>
          </div>
        </form>
      </div>
    )
  }
}

const mapStateToProps = state => ({
  auth: state.auth,
})

export default connect(mapStateToProps, actions)(Login)
