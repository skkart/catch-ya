import React from 'react'
import ShowProfileUserModel from './ShowProfileUserModel'

export default function Chatboard({ info }) {
  return (
    <div
      className="contact-profile cursor-pointer"
      data-toggle="modal"
      data-target="#showProfileUserProfile"
      data-whatever="@mdo"
    >
      <img
        src={`data:image/png;base64,${info.avatar}`}
        alt=""
        className={info.status}
      />
      <div className="profileGroup">
        <p className="profileName">{info.name}</p>
        <p className="preview">
          <span className={`status-ball contact-status ${info.status}`} title={info.status} />
          {info.participants && <span className="status-text status-text-group">{`${info.participants} participants`}</span>}
          <span className="status-text">{info.status}</span>
        </p>
      </div>
      <div className="social-media" />
      <ShowProfileUserModel profile={info} />
    </div>
  )
}