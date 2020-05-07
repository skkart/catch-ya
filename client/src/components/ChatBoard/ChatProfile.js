import React, {useState, useEffect} from 'react'
import ShowProfileUserModel from './ShowProfileUserModel'

export default function Chatboard({ info }) {
  const [refreshCount, setRefreshCount] = useState(0)

  useEffect(() => {
    setRefreshCount(0)
  }, [info])

  return (
    <div
      className="contact-profile cursor-pointer"
      data-toggle="modal"
      data-target="#showProfileUserProfile"
      data-whatever="@mdo"
      onClick={() => setRefreshCount(ct => ct + 1)}
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
      <ShowProfileUserModel profile={info} refreshCount={refreshCount}/>
    </div>
  )
}