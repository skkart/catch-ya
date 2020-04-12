import React from 'react'

export default function ShowProfileUserModel(props) {
  return (
    <div
      className="modal fade"
      id="showProfileUserProfile"
      tabIndex="-1"
      role="dialog"
      aria-hidden="true"
    >
      <div className="modal-dialog modal-dialog-centered" role="document">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Profile Info</h5>
            <button type="button" className="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div className="modal-body">
            <form noValidate>
              <div className="input-group mb-3">
                <div className="input-group-prepend">
                  <span className="input-group-text" id="pfname">Name</span>
                </div>
                <input
                  type="text"
                  className="form-control"
                  aria-label="Default"
                  aria-describedby="pfname"
                  value={props.profile.name}
                  disabled
                />
              </div>
              <div className="input-group mb-3">
                <div className="input-group-prepend">
                  <span className="input-group-text" id="pfstatus">Status</span>
                </div>
                <input
                  type="text"
                  className="form-control"
                  aria-label="Default"
                  aria-describedby="pfstatus"
                  value={props.profile.about}
                  disabled
                />
              </div>
              <div className="form-group picture">
                <span className="input-group-text">Profile Picture</span>
                <div className="image-wrapper">
                  <div className="box">
                    <div
                      className="js--image-preview js--no-default"
                      style={{ backgroundImage: `url(data:image/png;base64,${props.profile.avatar})` }}
                    />
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}