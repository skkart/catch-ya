import React, { useState, useRef } from 'react'
import axios from 'axios'
import './addGroupForm.css'
import { connect } from 'react-redux'
import { loadUserChats } from '../../actions'

function AddUserModel(props) {
  const closeButton = useRef(null)
  const imagePreview = useRef(null)
  const fileUpload = useRef(null)
  const [chatForm, setChatForm] = useState({
    name: '',
    about: ''
  })
  const [flushAvatar, setFlushAvatar] = useState(false)
  const [avatarFile, setAvatarFile] = useState(null)

  const onContactSubmit = async (e) => {
    e.preventDefault()
    console.log('chatForm, ', chatForm)
    try {
      if (chatForm.name) {
        // First upload Group
        const added = await axios.post('/users', chatForm)
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

        await props.loadUserChats()
        setFlushAvatar(true)
        setAvatarFile(null)
        setChatForm({
          name: '',
          about: ''
        })
        closeButton.current.click()
      }
    } catch (err) {
      console.log('Error in Create group', err)
      alert('Failed to create group: ', err)
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
      id="addGroupModel"
      tabIndex="-1"
      role="dialog"
      aria-hidden="true"
    >
      <div className="modal-dialog modal-dialog-centered" role="document">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Add New Group</h5>
            <button ref={closeButton} type="button" className="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div className="modal-body">
            <form noValidate onSubmit={onContactSubmit}>
              <div className="form-group">
                <label htmlFor="name">Group Name</label>
                <input
                  type="text"
                  className="form-control form-control-lg"
                  id="name"
                  placeholder="Enter Group Name"
                  value={chatForm.name}
                  onChange={(e) => {
                    setChatForm({
                      name: e.target.value,
                      about: chatForm.about
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
                  value={chatForm.about}
                  onChange={(e) => {
                    setChatForm({
                      name: chatForm.name,
                      about: e.target.value
                    })
                  }}
                />
              </div>


              flushAvatar && (
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
)


              <button type="submit" className="btn btn-primary">Submit</button>
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