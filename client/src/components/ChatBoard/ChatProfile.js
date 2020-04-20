import React from 'react'
import ShowProfileUserModel from './ShowProfileUserModel'

export default function Chatboard({ info }) {
  return (
    <div className="contact-profile">
      <img
        src={`data:image/png;base64,${info.avatar}`}
        alt=""
        data-toggle="modal"
        data-target="#showProfileUserProfile"
        data-whatever="@mdo"
        className={info.status}
      />
      <p className="profileName">{info.name}</p>
      <div className="social-media" />
      <ShowProfileUserModel profile={info} />
    </div>
  )
}