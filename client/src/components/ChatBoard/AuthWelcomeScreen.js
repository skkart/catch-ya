import React, { useEffect } from 'react'
import { connect } from 'react-redux'
import Loader from 'react-loader-spinner'

function AuthWelcomeScreen(props) {
  useEffect(() => {
    if (props.auth && props.auth.email) {
      props.history.push('/dashboard') // push user to dashboard when they login
    }
  }, [props.auth])

  const isLoggedIn = props.auth && props.auth.email
  const isAuth = props.auth && props.auth.isAuth
  // Show loader
  if (typeof isAuth !== 'boolean') {
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
          <Loader className="chatLoaderMain" type="ThreeDots" height={125} width={250} />
        </div>
      </div>
    )
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

        {
          isLoggedIn ?
            (
              <div className="form-row text-center">
                <div className="col-12">
                  <button
                    className="btn btn-warning"
                    onClick={() => props.history.push('/dashboard')}
                  >
                  Get Started
                  </button>
                </div>
              </div>
            )
            :
            [(<div className="form-row text-center" key="login">
              <div className="col-12">
                <button
                  className="btn btn-primary"
                  onClick={() => props.history.push('/sign-in')}
                >
                  Login
                </button>
              </div>
            </div>),
            (<div className="form-row text-center" key="signup">
              <div className="col-12">
                <button
                  className="btn btn-success"
                  onClick={() => props.history.push('/sign-up')}
                >
                Sign Up
                </button>
              </div>
             </div>)]
        }
      </div>
    </div>
  )
}

const mapStateToProps = state => ({
  auth: state.auth,
})

export default connect(mapStateToProps, null)(AuthWelcomeScreen)