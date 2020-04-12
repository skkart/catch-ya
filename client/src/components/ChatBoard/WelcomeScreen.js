import React from 'react'

export default function WelcomeScreen(props) {
  return (
    <div className="welcomeScreen row h-100">
      <div className="col-sm-12 my-auto mb-4">
        <h3 className="h3 mb-3 font-weight-normal">Welcome to Catch-Ya!!!</h3>
        <div
          className="image mb-4"
        />
        <div
          className="form-row text-center">
          <div className="col-12">
            <p>Chat with your friends, family and groups</p>
          </div>
        </div>

        <div className="form-row text-center">
          <div className="col-12">
            <button
              className="btn btn-success"
              title="Get started"
              data-toggle="modal"
              data-target="#addFormModel"
              data-whatever="@mdo"
            >
Get Started
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}