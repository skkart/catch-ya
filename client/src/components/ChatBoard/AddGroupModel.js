import React, { useState, useRef } from 'react'
import Loader from 'react-loader-spinner'
import { connect } from 'react-redux'
import axios from 'axios'
import { store } from 'react-notifications-component'
import { loadUserChats } from '../../actions'

function AddGroupModel(props) {
  const closeButton = useRef(null)
  const imagePreview = useRef(null)
  const fileUpload = useRef(null)
  const [submitted, setSubmitted] = useState(false)
  const [chatGroupForm, setChatGroupForm] = useState({
    name: '',
    about: ''
  })
  const [flushAvatar, setFlushAvatar] = useState(false)
  const [avatarFile, setAvatarFile] = useState(null)

  const onChatGroupSubmit = async (e) => {
    setSubmitted(true)
    e.preventDefault()
    console.log('chatGroupForm, ', chatGroupForm)
    try {
      if (chatGroupForm.name) {
        // First upload Group
        const added = await axios.post('/chatGroups', chatGroupForm)
        console.log('added group', added)

        // Upload Avatar
        if (avatarFile) {
          const formData = new FormData()
          formData.append('avatar', avatarFile)
          const config = {
            headers: {
              'content-type': 'multipart/form-data'
            }
          }
          await axios.post(`/chatGroups/${added.data._id}/avatar`, formData, config)
        }
        setFlushAvatar(true)
        setAvatarFile(null)
        setChatGroupForm({
          name: '',
          about: ''
        })

        await props.loadUserChats()
        closeButton.current.click()
      }
    } catch (err) {
      console.log('Error in Create group', err)
      store.addNotification({
        title: 'Try again!!!',
        message: 'Failed to create group',
        type: 'danger',
        insert: 'top',
        container: 'center',
        animationIn: ['animated', 'fadeIn', 'jackInTheBox'],
        animationOut: ['animated', 'fadeOut'],
        dismiss: {
          duration: 3000,
          pauseOnHover: true
        }
      })
    } finally {
      setSubmitted(false)
      setFlushAvatar(false)
    }
  }

  const readURL = function () {
    const input = fileUpload.current
    const imagePreviewBox = imagePreview.current
    const file = input.files && input.files[0]
    if (file) {
      const imageType = /image.*/
      if (!file || !file.type.match(imageType)) {
        // throw new Error('Invalid Image File')
        store.addNotification({
          title: 'Error!',
          message: 'Invalid Image Format',
          type: 'danger',
          insert: 'top',
          container: 'center',
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
      id="addGroupModel"
      tabIndex="-1"
      role="dialog"
      aria-hidden="true"
    >
      <div
        className={submitted ? 'modal-dialog modal-dialog-centered disabled-state' : 'modal-dialog modal-dialog-centered'}
        role="document"
      >
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Create Group</h5>
            <button ref={closeButton} type="button" className="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div className="modal-body">
            <form noValidate onSubmit={onChatGroupSubmit}>
              <div className="form-group">
                <label htmlFor="name">Group Name</label>
                <input
                  type="text"
                  className="form-control form-control-lg"
                  id="name"
                  placeholder="Enter Group Name"
                  value={chatGroupForm.name}
                  onChange={(e) => {
                    setChatGroupForm({
                      name: e.target.value,
                      about: chatGroupForm.about
                    })
                  }}
                />
              </div>
              <div className="form-group">
                <label htmlFor="status">Status</label>
                <input
                  type="text"
                  className="form-control form-control-lg"
                  id="status"
                  placeholder="Enter Group Status"
                  value={chatGroupForm.about}
                  onChange={(e) => {
                    setChatGroupForm({
                      name: chatGroupForm.name,
                      about: e.target.value
                    })
                  }}
                />
              </div>


              {!flushAvatar && (
                <div className="form-group">
                  <label>Upload Profile Picture</label>
                  <div className="image-wrapper">
                    <div className="box">
                      <div ref={imagePreview} className="js--image-preview" />
                      <div className="upload-options">
                        <label>
                          <input ref={fileUpload} type="file" onChange={readURL} className="image-upload" accept="image/*" />
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}

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
  chat: state.chat
})

export default connect(
  mapStateToProps,
  { loadUserChats }
)(AddGroupModel)