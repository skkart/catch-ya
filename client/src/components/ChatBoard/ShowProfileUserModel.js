import React, { useEffect, useState } from 'react'
import axios from 'axios'
import Loader from 'react-loader-spinner'

export default function ShowProfileUserModel(props) {
  const [loading, setLoading] = useState(false)
  const [contactList, setContactList] = useState([])


  const fetchAllGroupParticipants = async() => {
    try {
      if (props.profile.isGroup) {
        setLoading(true)
        const res = await axios.get(`/chatGroups/${props.profile._id}/participants`)
        setContactList(res.data)
      } else {
        setContactList([])
      }
    } catch (e) {
      console.log('Error on fetchAllGroupParticipants', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (props.refreshCount <= 1) {
      fetchAllGroupParticipants()
      console.log('Chat list fetchAllGroupParticipants')
    }
  }, [props.refreshCount])

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
            {
              loading ? <Loader className="chatLoaderMain" type="ThreeDots" height={50} width={80} />
                : (
                  <div className="form-group mx-sm-3 mb-2 contacts">
                    {
                      contactList.length > 0 &&
                <span className="list-suggestion">People</span>
                    }
                    <ul className="list-group">
                      {contactList.map(contact => (
                        <li
                          className="list-group-item list-group-item-action list-group-item-light contact"
                          key={contact._id}
                        >
                          <div className="wrap">
                            {contact.status && <span className={`contact-status ${contact.status}`} />}
                            <img src={`data:image/png;base64,${contact.avatar}`} alt="" />
                            <div className="meta">
                              <p className="name">{contact.name}</p>
                              <p className="preview">{contact.about}</p>
                            </div>
                          </div>
                        </li>
                      ))
                      }
                    </ul>
                  </div>
                )}
          </div>
        </div>
      </div>
    </div>
  )
}