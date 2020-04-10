import React, { useState, useRef } from 'react'
import Loader from 'react-loader-spinner'
import { connect } from 'react-redux'
import axios from 'axios'
import './addGroupForm.css'
import { initUserAuth } from '../../actions'

function UpdateUserModel(props) {
  const closeButton = useRef(null)
  const imagePreview = useRef(null)
  const fileUpload = useRef(null)
  const [submitted, setSubmitted] = useState(false)
  const [userForm, setUserForm] = useState({
    name: props.auth.name,
    about: props.auth.about
  })
  const [avatarFile, setAvatarFile] = useState(null)

  const onUserSubmit = async (e) => {
    setSubmitted(true)
    e.preventDefault()
    console.log('userForm, ', userForm)
    try {
      let patchedUser = false
      if (userForm.name) {
        if (props.auth.name !== userForm.name || userForm.about !== props.auth.about) {
          // First upload Group
          const patched = await axios.patch('/users/me', userForm)
          console.log('patched user', patched)
          patchedUser = true
        }

        // Upload Avatar
        if (avatarFile) {
          const formData = new FormData()
          formData.append('avatar', avatarFile)
          const config = {
            headers: {
              'content-type': 'multipart/form-data'
            }
          }
          await axios.post('/users/me/avatar', formData, config)
          patchedUser = true
        }

        if (patchedUser) {
          await props.initUserAuth()
        }
        closeButton.current.click()
      }
    } catch (err) {
      console.log('Error in Update User', err)
      alert('Failed to Update Profile: ', err)
    } finally {
      setSubmitted(false)
    }
  }

  const readURL = function () {
    const input = fileUpload.current
    const imagePreviewBox = imagePreview.current
    const file = input.files && input.files[0]
    if (file) {
      const imageType = /image.*/
      if (!file || !file.type.match(imageType)) {
        throw 'Invalid Image FIle'
      }

      const reader = new FileReader()

      reader.onload = function (e) {
        setAvatarFile(file)
        imagePreviewBox.style.backgroundImage = `url(${e.target.result})`
      }

      reader.readAsDataURL(file)
      imagePreviewBox.className += ' js--no-default'
    }
  }

  return (
    <div
      className="modal fade"
      id="updateUserProfile"
      tabIndex="-1"
      role="dialog"
      aria-hidden="true"
      data-backdrop="static"
      data-keyboard="false"
    >
      <div className={submitted ? 'modal-dialog modal-dialog-centered disabled-state' : 'modal-dialog modal-dialog-centered'} role="document">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Update Profile</h5>
            <button ref={closeButton} type="button" className="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div className="modal-body">
            <form noValidate onSubmit={onUserSubmit}>
              <div className="form-group">
                <label htmlFor="name">User Name</label>
                <input
                  type="text"
                  className="form-control form-control-lg"
                  id="name"
                  placeholder="Enter Name"
                  value={userForm.name}
                  disabled={true}
                />
              </div>
              <div className="form-group">
                <label htmlFor="status">Status</label>
                <input
                  type="text"
                  className="form-control form-control-lg"
                  id="status"
                  placeholder="Enter Status"
                  value={userForm.about}
                  onChange={(e) => {
                    setUserForm({
                      name: userForm.name,
                      about: e.target.value
                    })
                  }}
                />
              </div>
              <div className="form-group">
                <label>Upload Profile Picture</label>
                <div className="image-wrapper">
                  <div className="box">
                    <div
                      ref={imagePreview}
                      className="js--image-preview js--no-default"
                      style={{ backgroundImage: `url(data:image/png;base64,${props.auth.avatar})` }}
                    />
                    <div className="upload-options">
                      <label>
                        <input ref={fileUpload} type="file" onChange={readURL} className="image-upload" accept="image/*" />
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {
                submitted ? (
                  <button className="btn btn-primary float-right">
                    <Loader className="chatLoader" type="ThreeDots" height={30} width={60} />
                  </button>
                ) : (
                  <button type="submit" className="btn btn-primary float-right">
                    Submit
                  </button>
                )}
            </form>
          </div>
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
  { initUserAuth }
)(UpdateUserModel)