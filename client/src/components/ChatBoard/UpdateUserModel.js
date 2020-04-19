import React, { useState, useRef } from 'react'
import Loader from 'react-loader-spinner'
import { connect } from 'react-redux'
import axios from 'axios'
import { store } from 'react-notifications-component'
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
      store.addNotification({
        title: 'Try again!!!',
        message: 'Failed to update profile!!',
        type: 'danger',
        insert: 'top',
        container: 'top-right',
        animationIn: ['animated', 'fadeIn', 'jackInTheBox'],
        animationOut: ['animated', 'fadeOut'],
        dismiss: {
          duration: 3000,
          pauseOnHover: true
        }
      })
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
        store.addNotification({
          title: 'Error!',
          message: 'Invalid Image Format',
          type: 'danger',
          insert: 'top',
          container: 'top-right',
          animationIn: ['animated', 'fadeIn', 'jackInTheBox'],
          animationOut: ['animated', 'fadeOut'],
          dismiss: {
            duration: 3000,
            pauseOnHover: true
          }
        })
        return
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
              <div className="input-group mb-3">
                <div className="input-group-prepend">
                  <span className="input-group-text" id="usrname">Name</span>
                </div>
                <input
                  type="text"
                  className="form-control"
                  aria-label="Default"
                  aria-describedby="usrname"
                  value={userForm.name}
                  disabled
                />
              </div>
              <div className="input-group mb-3">
                <div className="input-group-prepend">
                  <span className="input-group-text" id="usrstatus">Status</span>
                </div>
                <input
                  type="text"
                  className="form-control"
                  aria-label="Default"
                  aria-describedby="usrstatus"
                  value={userForm.about}
                  onChange={(e) => {
                    setUserForm({
                      name: userForm.name,
                      about: e.target.value
                    })
                  }}
                />
              </div>
              <div className="form-group picture">
                <span className="input-group-text">Profile Picture</span>
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